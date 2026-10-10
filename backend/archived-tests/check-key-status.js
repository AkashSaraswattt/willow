require('dotenv').config();

// Import the service to check internal state
const geminiService = require('./src/services/geminiPoolService');

// Access internal state (this is just for debugging)
console.log('=== GEMINI KEY STATUS ===');

const keys = [
  process.env.GEMINI_KEY_1,
  process.env.GEMINI_KEY_2, 
  process.env.GEMINI_KEY_3
];

keys.forEach((key, index) => {
  console.log(`Key ${index}: ${key?.slice(0, 20)}...`);
});

// Test each key individually
async function checkAllKeys() {
  const axios = require('axios');
  
  for (let i = 0; i < keys.length; i++) {
    console.log(`\nTesting Key ${i}:`);
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keys[i]}`,
        {
          contents: [{ parts: [{ text: 'Say hello' }] }]
        },
        { timeout: 3000 }
      );
      console.log(`  ✅ WORKING - Response: ${response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.slice(0, 30)}`);
    } catch (error) {
      if (error.response?.status === 429) {
        console.log(`  ❌ EXHAUSTED - ${error.response.data.error.message.slice(0, 80)}...`);
      } else {
        console.log(`  ❌ ERROR - ${error.message}`);
      }
    }
  }
}

checkAllKeys();