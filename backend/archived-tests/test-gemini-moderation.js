const { moderateAndRewrite } = require('./src/services/geminiService');
require('dotenv').config();

async function testModeration() {
  console.log('Testing Gemini Moderation Pipeline\n');
  
  const testCases = [
    { name: 'SAFE', text: 'hello bro' },
    { name: 'REWRITE 1', text: 'your iq is negative' },
    { name: 'REWRITE 2', text: 'you are stupid idiot' },
    { name: 'BLOCK', text: 'I will kill you' },
    { name: 'EMPTY', text: '' },
    { name: 'WHITESPACE', text: '   ' }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n--- ${testCase.name} TEST ---`);
    console.log(`Input: "${testCase.text}"`);
    
    const startTime = Date.now();
    const result = await moderateAndRewrite(testCase.text);
    const latency = Date.now() - startTime;
    
    console.log(`Result: ${JSON.stringify(result)}`);
    console.log(`Latency: ${latency}ms`);
    
    if (result.ok) {
      const decision = result.text === testCase.text ? 'SAFE' : 
                      result.text === '<<BLOCK>>' ? 'BLOCK' : 'REWRITE';
      console.log(`Decision: ${decision}`);
    }
  }
}

testModeration().catch(console.error);