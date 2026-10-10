const axios = require('axios');
require('dotenv').config();

async function testGeminiDirect() {
  const keys = Object.keys(process.env).filter(k => k.startsWith('GEMINI_KEY_'));
  console.log(`Found ${keys.length} Gemini keys`);
  
  if (keys.length === 0) {
    console.log('No Gemini keys found');
    return;
  }
  
  const apiKey = process.env[keys[0]];
  console.log(`Testing with key: ${keys[0]} = ${apiKey.substring(0, 10)}...`);
  
  const payload = {
    contents: [{
      parts: [{ text: "Say hello in one sentence" }]
    }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 50 }
  };
  
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      payload,
      { timeout: 10000, headers: { 'Content-Type': 'application/json' } }
    );
    
    console.log('SUCCESS:', response.data?.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (error) {
    console.log('ERROR:', error.response?.data || error.message);
  }
}

async function testGroqDirect() {
  const apiKey = process.env.GROQ_API_KEY;
  console.log(`Testing Groq with key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING'}`);
  
  if (!apiKey) {
    console.log('No Groq API key found');
    return;
  }
  
  const payload = {
    messages: [{ role: 'user', content: 'Say hello in one sentence' }],
    model: 'llama-3.1-8b-instant',
    max_tokens: 50
  };
  
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      payload,
      { 
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('SUCCESS:', response.data?.choices?.[0]?.message?.content);
  } catch (error) {
    console.log('ERROR:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('=== Testing Gemini ===');
  await testGeminiDirect();
  
  console.log('\n=== Testing Groq ===');
  await testGroqDirect();
}

main().catch(console.error);