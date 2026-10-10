require('dotenv').config();
const { Resend } = require('resend');

async function testResendAPI() {
  const apiKey = process.env.RESEND_API_KEY;
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');
  
  if (!apiKey) {
    console.log('❌ RESEND_API_KEY not found');
    return;
  }
  
  const resend = new Resend(apiKey);
  
  try {
    // Test API key validity
    const result = await resend.emails.send({
      from: 'Willow <onboarding@resend.dev>',
      to: 'aditya09313@gmail.com',
      subject: 'Test Email',
      html: '<p>Test email from Resend API</p>'
    });
    
    console.log('✅ Email sent successfully');
    console.log('Email ID:', result.data?.id);
  } catch (error) {
    console.log('❌ Resend API Error:');
    console.log('Status:', error.statusCode);
    console.log('Message:', error.message);
    console.log('Details:', error.name);
  }
}

testResendAPI();