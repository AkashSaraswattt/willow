const { moderateWithGemini } = require('./src/services/geminiPoolService');
require('dotenv').config();

async function testGeminiRoundRobin() {
  console.log('=== Testing Actual Gemini Round-Robin ===\n');
  
  const testMessages = [
    'Hello world',
    'How are you?',
    'Good morning',
    'Nice weather today',
    'Thank you very much'
  ];
  
  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    console.log(`Test ${i + 1}: "${message}"`);
    
    const result = await moderateWithGemini(message, {
      perAttemptTimeoutMs: 3000,
      maxAttempts: 1
    });
    
    if (result.ok) {
      console.log(`✅ Success - Key: ${result.keyIndex}, Result: "${result.text}"`);
    } else {
      console.log(`❌ Failed - Reason: ${result.reason}`);
    }
    console.log('');
  }
}

testGeminiRoundRobin().catch(console.error);