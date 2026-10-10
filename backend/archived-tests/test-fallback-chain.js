require('dotenv').config();
const { moderateWithGemini } = require('./src/services/geminiPoolService');
const { moderateWithGroq } = require('./src/services/groqService');

async function testFallbackChain() {
  const text = "you are stupid";
  
  console.log('Testing fallback chain for:', text);
  
  // Test Gemini
  console.log('\n1. Trying Gemini...');
  const geminiResult = await moderateWithGemini(text);
  console.log('Gemini result:', geminiResult);
  
  if (!geminiResult.ok) {
    // Test Groq fallback
    console.log('\n2. Gemini failed, trying Groq...');
    const groqResult = await moderateWithGroq(text);
    console.log('Groq result:', groqResult);
    
    if (!groqResult.ok) {
      console.log('\n3. Both failed - FAIL_OPEN with original text');
    }
  }
}

testFallbackChain().catch(console.error);