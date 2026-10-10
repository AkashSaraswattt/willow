// Test script for OTP email functionality
// Run with: node test-otp-email.js

require('dotenv').config();
const { sendOtpEmail } = require('./src/services/emailOtpService.js');

async function testOtpEmail() {
  console.log('Testing OTP email service...');
  console.log('Configured sender:', process.env.EMAIL_SENDER || 'Default sender');
  
  const testEmail = 'test@example.com';
  const testOtp = '123456';
  
  try {
    const result = await sendOtpEmail(testEmail, testOtp);
    console.log('Result:', result);
    
    if (result.success) {
      console.log('✅ OTP email sent successfully');
    } else {
      console.log('❌ Failed to send OTP email:', result.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOtpEmail();