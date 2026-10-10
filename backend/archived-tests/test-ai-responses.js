const geminiService = require('./src/services/geminiService.js');
const grokService = require('./src/services/grokService.js');
require('dotenv').config();

async function testAIResponses() {
  console.log('Testing AI responses with IST context...\n');
  
  const tests = [
    'prime minister of india',
    'whats todays day',
    'whats todays date',
    'hello'
  ];
  
  for (const query of tests) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Query: "${query}"\n`);
    
    // Test Gemini
    console.log('GEMINI:');
    try {
      const geminiResult = await geminiService.chat(query);
      if (geminiResult.success) {
        console.log(`✓ ${geminiResult.reply}`);
      } else {
        console.log(`✗ Error: ${geminiResult.error}`);
      }
    } catch (error) {
      console.log(`✗ Exception: ${error.message}`);
    }
    
    console.log();
    
    // Test Grok
    console.log('GROK:');
    try {
      const grokResult = await grokService.chat(query);
      if (grokResult.success) {
        console.log(`✓ ${grokResult.reply}`);
      } else {
        console.log(`✗ Error: ${grokResult.error}`);
      }
    } catch (error) {
      console.log(`✗ Exception: ${error.message}`);
    }
  }
}

testAIResponses().catch(console.error);