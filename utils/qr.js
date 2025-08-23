const QRCode = require('qrcode');

exports.generateQR = async (data) => {
  return await QRCode.toDataURL(data);
};
