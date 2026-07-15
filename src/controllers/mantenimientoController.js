const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { enviarWhatsApp, alertaStockBajo } = require('../services/whatsapp')

const getMantenimientos = async (req, res) => {
  try {
    const mantenimientos = await prisma.mantenimiento.findMany({
      include: {
        vehiculo: { include: { cliente: true } },
        servicios: true
      }
    })
    res.json(mantenimientos)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mantenimientos' })
  }
}

const getMantenimiento = async (req, res) => {
  try {
    const mantenimiento = await prisma.mantenimiento.findUnique({
      where: { id: req.params.id },
      include: {
        vehiculo: { include: { cliente: true } },
        servicios: true,
        recordatorios: true
      }
    })
    if (!mantenimiento) return res.status(404).json({ error: 'Mantenimiento no encontrado' })
    res.json(mantenimiento)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mantenimiento' })
  }
}

const crearMantenimiento = async (req, res) => {
  try {
    const { vehiculoId, fecha, kmEnServicio, kmProximo, fechaProxima, notas, servicios } = req.body

    if (!vehiculoId || !fecha || !kmEnServicio) {
      return res.status(400).json({ error: 'vehiculoId, fecha y kmEnServicio son requeridos' })
    }

    // Verificar stock suficiente antes de crear
    for (const servicio of (servicios || [])) {
      if (servicio.aceiteId && servicio.cantidadAceite) {
        const aceiteActual = await prisma.aceite.findUnique({
          where: { id: servicio.aceiteId }
        })
        if (aceiteActual.stockActual < servicio.cantidadAceite) {
          return res.status(400).json({
            error: `Stock insuficiente para ${aceiteActual.marca} ${aceiteActual.viscosidad}. Stock actual: ${aceiteActual.stockActual}, requerido: ${servicio.cantidadAceite}`
          })
        }
      }
    }

    const mantenimiento = await prisma.mantenimiento.create({
      data: {
        vehiculoId,
        fecha: new Date(fecha),
        kmEnServicio,
        kmProximo: kmProximo || null,
        fechaProxima: fechaProxima ? new Date(fechaProxima) : null,
        notas: notas || null,
        servicios: servicios ? {
          create: servicios.map(s => ({
            descripcion: s.descripcion,
            costo: s.costo,
            tipo: s.tipo,
            viscosidad: s.viscosidad || null,
            aceiteId: s.aceiteId || null,
            cantidadAceite: s.cantidadAceite || null
          }))
        } : undefined
      },
      include: { servicios: true }
    })

    // Actualizar kilometraje del vehículo
    await prisma.vehiculo.update({
      where: { id: vehiculoId },
      data: { kilometraje: kmEnServicio }
    })

    // Descontar inventario y verificar stock bajo
    const aceitesStockBajo = []

    for (const servicio of (servicios || [])) {
      if (servicio.aceiteId && servicio.cantidadAceite) {
        const aceite = await prisma.aceite.update({
          where: { id: servicio.aceiteId },
          data: { stockActual: { decrement: servicio.cantidadAceite } }
        })

        await prisma.movimientoInventario.create({
          data: {
            aceiteId: servicio.aceiteId,
            tipo: 'salida',
            cantidad: servicio.cantidadAceite,
            razon: 'mantenimiento',
            referencia: mantenimiento.id
          }
        })

        if (aceite.stockActual <= aceite.stockMinimo) {
          aceitesStockBajo.push(aceite)
        }
      }
    }

    console.log('Aceites con stock bajo:', aceitesStockBajo.length)

    if (aceitesStockBajo.length > 0) {
      const resultado = await alertaStockBajo(aceitesStockBajo)
      console.log('Resultado alerta admin:', resultado)
    }

    res.status(201).json({
      ...mantenimiento,
      alertasStockBajo: aceitesStockBajo.length > 0
        ? aceitesStockBajo.map(a => `${a.marca} ${a.viscosidad} — Stock: ${a.stockActual}`)
        : null
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al crear mantenimiento' })
  }
}

const actualizarMantenimiento = async (req, res) => {
  try {
    const mantenimiento = await prisma.mantenimiento.update({
      where: { id: req.params.id },
      data: req.body
    })
    res.json(mantenimiento)
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar mantenimiento' })
  }
}

const getMantenimientosPorVehiculo = async (req, res) => {
  try {
    const mantenimientos = await prisma.mantenimiento.findMany({
      where: { vehiculoId: req.params.vehiculoId },
      include: { servicios: true },
      orderBy: { fecha: 'desc' }
    })
    res.json(mantenimientos)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mantenimientos' })
  }
}

const enviarRecordatorioManual = async (req, res) => {
  try {
    const { mantenimientoId } = req.params

    const mantenimiento = await prisma.mantenimiento.findUnique({
      where: { id: mantenimientoId },
      include: { vehiculo: { include: { cliente: true } } }
    })

    if (!mantenimiento) {
      return res.status(404).json({ error: 'Mantenimiento no encontrado' })
    }

    const cliente = mantenimiento.vehiculo.cliente
    const vehiculo = mantenimiento.vehiculo
    const fechaProxima = mantenimiento.fechaProxima
      ? new Date(mantenimiento.fechaProxima).toLocaleDateString('es-SV')
      : 'próximamente'

    const mensaje = `Hola ${cliente.nombre} 👋\n\nLe recordamos que su vehículo *${vehiculo.marca} ${vehiculo.modelo}* (${vehiculo.placa}) tiene mantenimiento programado para el *${fechaProxima}*.\n\nContáctenos para agendar su cita. ¡Gracias por confiar en nosotros! 🔧`

    let resultado = { ok: false, error: 'Canal no soportado' }

    if (cliente.canalPref === 'whatsapp') {
      resultado = await enviarWhatsApp(cliente.telefono, mensaje)
    }

    await prisma.recordatorio.create({
      data: {
        mantenimientoId: mantenimiento.id,
        clienteId: cliente.id,
        fechaEnvio: new Date(),
        canal: cliente.canalPref,
        estado: resultado.ok ? 'enviado' : 'fallido'
      }
    })

    if (!resultado.ok) {
      return res.status(500).json({ error: 'Error al enviar mensaje', detalle: resultado.error })
    }

    res.json({
      mensaje: 'Recordatorio enviado correctamente',
      cliente: cliente.nombre,
      canal: cliente.canalPref,
      telefono: cliente.telefono
    })

  } catch (error) {
    res.status(500).json({ error: 'Error al enviar recordatorio' })
  }
}

const anularMantenimiento = async (req, res) => {
  try {
    const mantenimiento = await prisma.mantenimiento.findUnique({
      where: { id: req.params.id },
      include: { servicios: true }
    })

    if (!mantenimiento) {
      return res.status(404).json({ error: 'Mantenimiento no encontrado' })
    }

    if (mantenimiento.estado === 'anulado') {
      return res.status(400).json({ error: 'El mantenimiento ya está anulado' })
    }

    for (const servicio of mantenimiento.servicios) {
      if (servicio.aceiteId && servicio.cantidadAceite) {
        await prisma.aceite.update({
          where: { id: servicio.aceiteId },
          data: { stockActual: { increment: servicio.cantidadAceite } }
        })

        await prisma.movimientoInventario.create({
          data: {
            aceiteId: servicio.aceiteId,
            tipo: 'entrada',
            cantidad: servicio.cantidadAceite,
            razon: 'ajuste',
            referencia: mantenimiento.id
          }
        })
      }
    }

    const actualizado = await prisma.mantenimiento.update({
      where: { id: req.params.id },
      data: { estado: 'anulado' }
    })

    res.json({ mensaje: 'Mantenimiento anulado y stock revertido', mantenimiento: actualizado })

  } catch (error) {
    res.status(500).json({ error: 'Error al anular mantenimiento' })
  }
}

module.exports = {
  getMantenimientos,
  getMantenimiento,
  crearMantenimiento,
  actualizarMantenimiento,
  getMantenimientosPorVehiculo,
  enviarRecordatorioManual,
  anularMantenimiento
}