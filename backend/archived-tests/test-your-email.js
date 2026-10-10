require('dotenv').config();
const { sendOtpEmail } = require('./src/services/emailOtpService.js');

async function testYourEmail() {
  const email = process.argv[2];
  if (!email) {
    console.log('Usage: node test-your-email.js your-email@example.com');
    return;
  }
  
  console.log(`Testing email to: ${email}`);
  const result = await sendOtpEmail(email, '123456');
  console.log('Result:', result);
}

testYourEmail();