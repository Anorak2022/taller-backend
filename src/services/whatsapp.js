const twilio = require('twilio')

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const enviarWhatsApp = async (telefono, mensaje) => {
  try {
    const numeroFormateado = `whatsapp:+503${telefono.replace(/[-\s]/g, '')}`
    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: numeroFormateado,
      body: mensaje
    })
    console.log(`✓ WhatsApp enviado a ${numeroFormateado} — SID: ${message.sid}`)
    return { ok: true, sid: message.sid }
  } catch (error) {
    console.error(`✗ Error enviando WhatsApp:`, error.message)
    return { ok: false, error: error.message }
  }
}

const alertaStockBajo = async (aceites) => {
  try {
    const lista = aceites.map(a => `• ${a.marca} ${a.viscosidad} — ${a.stockActual} ${a.tipoEnvase}s`).join('\n')
    const mensaje = `⚠️ *Alerta de Stock Bajo — TallerPro*\n\nLos siguientes aceites están por debajo del mínimo:\n\n${lista}\n\nPor favor realiza una compra pronto.`
    return await enviarWhatsApp(process.env.ADMIN_TELEFONO, mensaje)
  } catch (error) {
    console.error('Error enviando alerta de stock:', error.message)
    return { ok: false }
  }
}

module.exports = { enviarWhatsApp, alertaStockBajo }