const geminiService = require('./src/services/geminiService.js');
const grokService = require('./src/services/grokService.js');
require('dotenv').config();

async function testServices() {
  console.log('Testing services directly...\n');
  
  console.log('=== Testing Gemini Service ===');
  try {
    const result = await geminiService.chat('hello');
    console.log('Gemini result:', result);
  } catch (error) {
    console.log('Gemini error:', error.message);
  }
  
  console.log('\n=== Testing Grok Service ===');
  try {
    const result = await grokService.chat('hello');
    console.log('Grok result:', result);
  } catch (error) {
    console.log('Grok error:', error.message);
  }
}

testServices();