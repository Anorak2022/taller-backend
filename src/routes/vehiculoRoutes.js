 
const express = require('express')
const router = express.Router()
const {
  getVehiculos,
  getVehiculo,
  crearVehiculo,
  actualizarVehiculo,
  eliminarVehiculo
} = require('../controllers/vehiculoController')

router.get('/', getVehiculos)
router.get('/:id', getVehiculo)
router.post('/', crearVehiculo)
router.put('/:id', actualizarVehiculo)
router.delete('/:id', eliminarVehiculo)

module.exports = router