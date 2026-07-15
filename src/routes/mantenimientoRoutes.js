
const express = require('express')
const router = express.Router()
const {
  getMantenimientos,
  getMantenimiento,
  crearMantenimiento,
  actualizarMantenimiento,
  getMantenimientosPorVehiculo,
  enviarRecordatorioManual,
  anularMantenimiento
} = require('../controllers/mantenimientoController')

router.get('/', getMantenimientos)
router.get('/:id', getMantenimiento)
router.post('/', crearMantenimiento)
router.put('/:id', actualizarMantenimiento)
router.get('/vehiculo/:vehiculoId', getMantenimientosPorVehiculo)
router.post('/:mantenimientoId/recordatorio', enviarRecordatorioManual)
router.patch('/:id/anular', anularMantenimiento)

module.exports = router