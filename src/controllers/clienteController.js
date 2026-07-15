 
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getClientes = async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      include: { vehiculos: true }
    })
    res.json(clientes)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener clientes' })
  }
}

const getCliente = async (req, res) => {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: req.params.id },
      include: { vehiculos: true }
    })
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' })
    res.json(cliente)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cliente' })
  }
}

const crearCliente = async (req, res) => {
  try {
    const { nombre, telefono, email, duiNit, direccion, telAlt, canalPref } = req.body
    if (!nombre || !telefono) {
      return res.status(400).json({ error: 'Nombre y teléfono son requeridos' })
    }
    const cliente = await prisma.cliente.create({
      data: { nombre, telefono, email, duiNit, direccion, telAlt, canalPref }
    })
    res.status(201).json(cliente)
  } catch (error) {
    res.status(500).json({ error: 'Error al crear cliente' })
  }
}

const actualizarCliente = async (req, res) => {
  try {
    const cliente = await prisma.cliente.update({
      where: { id: req.params.id },
      data: req.body
    })
    res.json(cliente)
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar cliente' })
  }
}

const eliminarCliente = async (req, res) => {
  try {
    await prisma.cliente.delete({ where: { id: req.params.id } })
    res.json({ mensaje: 'Cliente eliminado' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar cliente' })
  }
}

module.exports = { getClientes, getCliente, crearCliente, actualizarCliente, eliminarCliente }