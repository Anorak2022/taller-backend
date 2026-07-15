  
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getVehiculos = async (req, res) => {
  try {
    const vehiculos = await prisma.vehiculo.findMany({
      include: { cliente: true }
    })
    res.json(vehiculos)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener vehículos' })
  }
}

const getVehiculo = async (req, res) => {
  try {
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id: req.params.id },
      include: { cliente: true, mantenimientos: true }
    })
    if (!vehiculo) return res.status(404).json({ error: 'Vehículo no encontrado' })
    res.json(vehiculo)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener vehículo' })
  }
}

const crearVehiculo = async (req, res) => {
  try {
    const { clienteId, placa, marca, modelo, anio, kilometraje } = req.body
    if (!clienteId || !placa || !marca || !modelo || !anio) {
      return res.status(400).json({ error: 'clienteId, placa, marca, modelo y año son requeridos' })
    }
    const vehiculo = await prisma.vehiculo.create({
      data: { clienteId, placa, marca, modelo, anio, kilometraje: kilometraje || 0 }
    })
    res.status(201).json(vehiculo)
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Ya existe un vehículo con esa placa' })
    }
    res.status(500).json({ error: 'Error al crear vehículo' })
  }
}

const actualizarVehiculo = async (req, res) => {
  try {
    const vehiculo = await prisma.vehiculo.update({
      where: { id: req.params.id },
      data: req.body
    })
    res.json(vehiculo)
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar vehículo' })
  }
}

const eliminarVehiculo = async (req, res) => {
  try {
    await prisma.vehiculo.delete({ where: { id: req.params.id } })
    res.json({ mensaje: 'Vehículo eliminado' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar vehículo' })
  }
}

module.exports = { getVehiculos, getVehiculo, crearVehiculo, actualizarVehiculo, eliminarVehiculo }