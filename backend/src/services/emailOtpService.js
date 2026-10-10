const nodemailer = require('nodemailer');

// OTP generator
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    timeout: 30000
  });
};

const sendOtpEmail = async (email, otp) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email send failed: EMAIL_USER or EMAIL_PASS not configured');
    return { success: false, error: 'Email failed' };
  }

  const transporter = createTransporter();
  
  try {
    await transporter.sendMail({
      from: `"Willow" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Willow OTP Code',
      html: `<p>Your OTP code is: <strong>${otp}</strong></p><p>This code expires in 15 minutes.</p>`
    });
    return { success: true };
  } catch (error) {
    console.error('Email send failed:', error.message);
    return { success: false, error: 'Email failed' };
  }
};

module.exports = { sendOtpEmail, generateOtp };
