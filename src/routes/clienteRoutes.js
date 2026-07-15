 
const express = require('express')
const router = express.Router()
const {
  getClientes,
  getCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente
} = require('../controllers/clienteController')

router.get('/', getClientes)
router.get('/:id', getCliente)
router.post('/', crearCliente)
router.put('/:id', actualizarCliente)
router.delete('/:id', eliminarCliente)

module.exports = router