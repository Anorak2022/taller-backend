
const cron = require('node-cron')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { enviarWhatsApp } = require('./whatsapp')

const verificarRecordatorios = async () => {
  console.log('🔍 Revisando mantenimientos próximos...')

  const hoy = new Date()
  const en7dias = new Date()
  en7dias.setDate(hoy.getDate() + 7)

  try {
    const mantenimientos = await prisma.mantenimiento.findMany({
      where: {
        fechaProxima: {
          gte: hoy,
          lte: en7dias
        },
        estado: 'completado',
        recordatorios: {
          none: {
            fechaEnvio: {
              gte: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
            }
          }
        }
      },
      include: {
        vehiculo: {
          include: { cliente: true }
        }
      }
    })

    console.log(`📋 Encontrados ${mantenimientos.length} mantenimientos próximos`)

    for (const mantenimiento of mantenimientos) {
      const cliente = mantenimiento.vehiculo.cliente
      const vehiculo = mantenimiento.vehiculo

      const mensaje = `Hola ${cliente.nombre}, le recordamos que el vehículo ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.placa}) tiene mantenimiento programado para el ${mantenimiento.fechaProxima.toLocaleDateString('es-SV')}. ¡Contáctenos para agendar su cita!`

      if (cliente.canalPref === 'whatsapp') {
  await enviarWhatsApp(cliente.telefono, mensaje)
}

      // Registrar el recordatorio en la DB
      await prisma.recordatorio.create({
        data: {
          mantenimientoId: mantenimiento.id,
          clienteId: cliente.id,
          fechaEnvio: new Date(),
          canal: cliente.canalPref,
          estado: 'enviado'
        }
      })

      console.log(`✓ Recordatorio registrado para ${cliente.nombre}`)
    }

  } catch (error) {
    console.error('Error en scheduler:', error)
  }
}

// Corre todos los días a las 8:00 AM
const iniciarScheduler = () => {
  console.log('⏰ Scheduler de recordatorios iniciado')
  cron.schedule('0 8 * * *', verificarRecordatorios, {
    timezone: 'America/El_Salvador'
  })
}

// Exportamos también la función para poder probarla manualmente
module.exports = { iniciarScheduler, verificarRecordatorios }