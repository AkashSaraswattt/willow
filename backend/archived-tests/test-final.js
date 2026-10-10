const geminiService = require('./src/services/geminiService.js');
const grokService = require('./src/services/grokService.js');
require('dotenv').config();

async function testFinal() {
  console.log('Testing AI responses...\n');
  
  const tests = ['prime minister of india', 'whats todays day', 'whats todays date'];
  
  for (const query of tests) {
    console.log(`Query: "${query}"`);
    
    // Test Gemini
    const geminiResult = await geminiService.chat(query);
    console.log(`Gemini: ${geminiResult.success ? geminiResult.reply : 'Error'}`);
    
    // Test Grok  
    const grokResult = await grokService.chat(query);
    console.log(`Grok: ${grokResult.success ? grokResult.reply : 'Error'}`);
    
    console.log('---');
  }
}

testFinal();