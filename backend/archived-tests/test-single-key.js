require('dotenv').config();
const axios = require('axios');

async function testSingleKey() {
  const key = process.env.GEMINI_KEY_1;
  console.log('Testing key:', key?.slice(0, 20) + '...');
  
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        contents: [{ parts: [{ text: 'Say hello' }] }]
      },
      { timeout: 5000 }
    );
    
    console.log('SUCCESS:', response.data?.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (error) {
    console.log('ERROR:', error.response?.status, error.response?.data || error.message);
  }
}

testSingleKey();