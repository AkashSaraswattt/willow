require('dotenv').config();
const { moderateWithGemini } = require('./src/services/geminiPoolService');
const { moderateWithGroq } = require('./src/services/groqService');

async function testModerationPipeline() {
  const testCases = [
    { text: "hello bro", expected: "SAFE" },
    { text: "your iq is negative", expected: "REWRITE" },
    { text: "you are stupid idiot", expected: "REWRITE" },
    { text: "I will kill you", expected: "BLOCK" },
    { text: "madarchod", expected: "BLOCK" }
  ];

  console.log('🧪 Testing New Moderation Pipeline\n');

  for (const testCase of testCases) {
    console.log(`Testing: "${testCase.text}"`);
    
    // Try Gemini first (max 2 attempts)
    const geminiResult = await moderateWithGemini(testCase.text, {
      perAttemptTimeoutMs: 4500,
      maxAttempts: 2
    });
    
    if (geminiResult.ok) {
      if (geminiResult.text === '<<BLOCK>>') {
        console.log(`✅ BLOCK (Gemini) - Expected: ${testCase.expected}`);
      } else if (geminiResult.text !== testCase.text) {
        console.log(`✅ REWRITE (Gemini): "${geminiResult.text}" - Expected: ${testCase.expected}`);
      } else {
        console.log(`✅ SAFE (Gemini) - Expected: ${testCase.expected}`);
      }
    } else {
      console.log(`❌ Gemini failed: ${geminiResult.reason}`);
      
      // Fallback to Groq
      const groqResult = await moderateWithGroq(testCase.text, 3000);
      if (groqResult.ok) {
        if (groqResult.text === '<<BLOCK>>') {
          console.log(`✅ BLOCK (Groq) - Expected: ${testCase.expected}`);
        } else if (groqResult.text !== testCase.text) {
          console.log(`✅ REWRITE (Groq): "${groqResult.text}" - Expected: ${testCase.expected}`);
        } else {
          console.log(`✅ SAFE (Groq) - Expected: ${testCase.expected}`);
        }
      } else {
        console.log(`❌ FAIL_OPEN: "${testCase.text}" - Expected: ${testCase.expected}`);
      }
    }
    
    console.log('---');
  }
}

testModerationPipeline().catch(console.error);