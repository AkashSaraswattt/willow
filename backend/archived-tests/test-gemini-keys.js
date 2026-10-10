require('dotenv').config();
const axios = require('axios');

async function testGeminiKey(key, index) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        contents: [{ parts: [{ text: "Say hello" }] }],
        generationConfig: { temperature: 0.0, maxOutputTokens: 10 }
      },
      { timeout: 5000, headers: { 'Content-Type': 'application/json' } }
    );
    
    const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    console.log(`✅ Key ${index}: Working - "${result}"`);
    return true;
  } catch (error) {
    console.log(`❌ Key ${index}: ${error.response?.status || error.message}`);
    return false;
  }
}

async function testAllKeys() {
  console.log('Testing Gemini Keys...\n');
  
  const keys = [];
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('GEMINI_KEY_')) {
      keys.push(process.env[key]);
    }
  });
  
  console.log(`Found ${keys.length} keys\n`);
  
  for (let i = 0; i < keys.length; i++) {
    await testGeminiKey(keys[i], i);
  }
}

testAllKeys();