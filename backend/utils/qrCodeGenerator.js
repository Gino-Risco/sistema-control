const QRCode = require('qrcode');

async function generateQrBase64(text) {
  if (!text) throw new Error('Texto para QR es requerido');
  return await QRCode.toDataURL(text);
}

module.exports = { generateQrBase64 };