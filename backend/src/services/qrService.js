const QRCode = require('qrcode');

// Server-side QR generation
const generateGroupQR = async (joinCode, appUrl = 'https://willow-3osi.onrender.com') => {
  try {
    const joinUrl = `${appUrl}/join/${joinCode}`;
    const qrDataUrl = await QRCode.toDataURL(joinUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return {
      success: true,
      qrCode: qrDataUrl,
      joinUrl
    };
  } catch (error) {
    console.error('QR generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Client-side QR generation (for reference)
const generateQRClientSide = (joinCode, appUrl = window.location.origin) => {
  const joinUrl = `${appUrl}/join/${joinCode}`;
  
  // Use qrcode.js library on frontend:
  // npm install qrcode
  // import QRCode from 'qrcode'
  // 
  // QRCode.toCanvas(canvasElement, joinUrl, (error) => {
  //   if (error) console.error(error)
  //   console.log('QR code generated!')
  // })
  
  return joinUrl;
};

module.exports = {
  generateGroupQR,
  generateQRClientSide
};