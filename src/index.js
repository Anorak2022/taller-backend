const express = require('express')
const cors = require('cors')
require('dotenv').config()

const clienteRoutes = require('./routes/clienteRoutes')
const vehiculoRoutes = require('./routes/vehiculoRoutes')
const mantenimientoRoutes = require('./routes/mantenimientoRoutes')
const { iniciarScheduler } = require('./services/scheduler')
const authRoutes = require('./routes/authRoutes')
const app = express()
const PORT = process.env.PORT || 3000
const aceiteRoutes = require('./routes/aceiteRoutes')

app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)

app.use('/api/clientes', clienteRoutes)
app.use('/api/vehiculos', vehiculoRoutes)
app.use('/api/mantenimientos', mantenimientoRoutes)
app.use('/api/aceites', aceiteRoutes)

app.get('/', (req, res) => {
  res.json({ mensaje: 'Taller API funcionando ✓' })
})
iniciarScheduler()
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
app.get('/api/test-scheduler', async (req, res) => {
  const { verificarRecordatorios } = require('./services/scheduler')
  await verificarRecordatorios()
  res.json({ mensaje: 'Scheduler ejecutado, revisa la consola' })
})