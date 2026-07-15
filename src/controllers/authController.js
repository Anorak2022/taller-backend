
const jwt = require('jsonwebtoken')
require('dotenv').config()

// Usuario hardcodeado por ahora, después lo movemos a DB
const USUARIO = {
  email: 'admin@taller.com',
  password: 'taller123',
  nombre: 'Administrador'
}

const login = (req, res) => {
  const { email, password } = req.body

  if (email !== USUARIO.email || password !== USUARIO.password) {
    return res.status(401).json({ error: 'Credenciales incorrectas' })
  }

  const token = jwt.sign(
    { email: USUARIO.email, nombre: USUARIO.nombre },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  )

  res.json({ token, nombre: USUARIO.nombre })
}

module.exports = { login }