
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getAceites = async (req, res) => {
  try {
    const aceites = await prisma.aceite.findMany({
      where: { activo: true },
      orderBy: { marca: 'asc' }
    })
    res.json(aceites)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener aceites' })
  }
}

const crearAceite = async (req, res) => {
  try {
    const { marca, viscosidad, tipoEnvase, stockActual, stockMinimo, precioCompra } = req.body
    if (!marca || !viscosidad || !tipoEnvase) {
      return res.status(400).json({ error: 'Marca, viscosidad y tipo de envase son requeridos' })
    }
    const aceite = await prisma.aceite.create({
      data: { marca, viscosidad, tipoEnvase, stockActual: stockActual || 0, stockMinimo: stockMinimo || 5, precioCompra }
    })
    res.status(201).json(aceite)
  } catch (error) {
    res.status(500).json({ error: 'Error al crear aceite' })
  }
}

const registrarEntrada = async (req, res) => {
  try {
    const { aceiteId, cantidad, razon } = req.body
    if (!aceiteId || !cantidad) {
      return res.status(400).json({ error: 'aceiteId y cantidad son requeridos' })
    }

    const aceite = await prisma.aceite.update({
      where: { id: aceiteId },
      data: { stockActual: { increment: cantidad } }
    })

    await prisma.movimientoInventario.create({
      data: { aceiteId, tipo: 'entrada', cantidad, razon: razon || 'compra' }
    })

    res.json({ mensaje: 'Entrada registrada', stockActual: aceite.stockActual })
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar entrada' })
  }
}

const getMovimientos = async (req, res) => {
  try {
    const movimientos = await prisma.movimientoInventario.findMany({
      include: { aceite: true },
      orderBy: { fecha: 'desc' },
      take: 50
    })
    res.json(movimientos)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener movimientos' })
  }
}

const getStockBajo = async (req, res) => {
  try {
    const aceites = await prisma.aceite.findMany({
      where: {
        activo: true,
        stockActual: { lte: prisma.aceite.fields.stockMinimo }
      }
    })
    res.json(aceites)
  } catch (error) {
    // Fallback con query manual
    const aceites = await prisma.$queryRaw`
      SELECT * FROM "Aceite" WHERE activo = true AND "stockActual" <= "stockMinimo"
    `
    res.json(aceites)
  }
}

module.exports = { getAceites, crearAceite, registrarEntrada, getMovimientos, getStockBajo }