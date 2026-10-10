require('dotenv').config();
const { Resend } = require('resend');

async function detailedEmailTest() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    const result = await resend.emails.send({
      from: 'Willow <onboarding@resend.dev>',
      to: 'aditya09313@gmail.com',
      subject: 'Willow OTP Test - Check This Email',
      html: `
        <h2>Willow OTP Test</h2>
        <p>Your test OTP code is: <strong>123456</strong></p>
        <p>If you received this email, the service is working correctly.</p>
        <p>Time sent: ${new Date().toISOString()}</p>
      `
    });
    
    console.log('✅ Email sent successfully');
    console.log('Full result:', JSON.stringify(result, null, 2));
    
    // Wait and check delivery status if possible
    if (result.data?.id) {
      console.log('Email ID for tracking:', result.data.id);
    }
    
  } catch (error) {
    console.log('❌ Error details:');
    console.log('Status Code:', error.statusCode);
    console.log('Error Name:', error.name);
    console.log('Error Message:', error.message);
    console.log('Full Error:', JSON.stringify(error, null, 2));
  }
}

detailedEmailTest();