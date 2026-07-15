
const express = require('express')
const router = express.Router()
const { getAceites, crearAceite, registrarEntrada, getMovimientos, getStockBajo } = require('../controllers/aceiteController')

router.get('/', getAceites)
router.post('/', crearAceite)
router.post('/entrada', registrarEntrada)
router.get('/movimientos', getMovimientos)
router.get('/stock-bajo', getStockBajo)

module.exports = router