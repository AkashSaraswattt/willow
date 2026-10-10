require('dotenv').config();
const { sendOtpEmail, generateOtp } = require('./src/services/emailOtpService.js');

async function debugOtp() {
  console.log('=== OTP Debug Information ===');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Missing');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Missing');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set' : 'Missing');
  console.log('EMAIL_SENDER:', process.env.EMAIL_SENDER);
  
  // Test with your actual email
  const testEmail = process.env.EMAIL_USER; // Send to yourself
  const testOtp = generateOtp();
  
  console.log('\n=== Testing OTP Email ===');
  console.log('Sending to:', testEmail);
  console.log('OTP:', testOtp);
  
  try {
    const result = await sendOtpEmail(testEmail, testOtp);
    console.log('Result:', result);
    
    if (result.success) {
      console.log('✅ OTP email sent successfully');
      console.log('Check your email:', testEmail);
    } else {
      console.log('❌ Failed to send OTP email');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Exception occurred:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugOtp();