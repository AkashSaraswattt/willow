require('dotenv').config();
const { moderateWithGemini } = require('./src/services/geminiPoolService');
const { moderateWithGroq } = require('./src/services/groqService');

async function testModeration() {
  const testCases = [
    "hello bro",
    "your iq is negative", 
    "you are stupid idiot",
    "I will kill you"
  ];

  console.log('Testing new moderation pipeline...\n');

  for (const text of testCases) {
    console.log(`Testing: "${text}"`);
    
    // Test Gemini
    const geminiResult = await moderateWithGemini(text);
    console.log(`  Gemini: ${geminiResult.ok ? `"${geminiResult.text}"` : `FAILED (${geminiResult.reason})`}`);
    
    // Test Groq fallback
    if (!geminiResult.ok) {
      const groqResult = await moderateWithGroq(text);
      console.log(`  Groq: ${groqResult.ok ? `"${groqResult.text}"` : 'FAILED'}`);
    }
    
    console.log('');
  }
}

testModeration().catch(console.error);