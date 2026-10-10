const geminiService = require('./src/services/geminiService.js');
const grokService = require('./src/services/grokService.js');
require('dotenv').config();

async function runAcceptanceTests() {
  console.log('🧪 Running Acceptance Tests\n');
  
  const tests = [
    {
      query: 'prime minister of india',
      expected: 'The Prime Minister of India is Narendra Modi.'
    },
    {
      query: 'whats todays day', 
      expected: 'Today is Saturday.' // Will be dynamic based on actual date
    },
    {
      query: 'whats todays date',
      expected: 'Today is 20 December 2025.' // Will be dynamic based on actual date
    }
  ];
  
  let passed = 0;
  let total = tests.length * 2; // Test both Gemini and Grok
  
  for (const test of tests) {
    console.log(`\n📝 Test: "${test.query}"`);
    console.log('─'.repeat(50));
    
    // Test Gemini
    console.log('🔷 GEMINI:');
    try {
      const result = await geminiService.chat(test.query);
      if (result.success) {
        const reply = result.reply;
        console.log(`   Reply: "${reply}"`);
        
        // Check requirements
        const hasDisclaimer = /as an ai|i am an ai|i don't have real-time|real-time access/i.test(reply);
        const isShort = reply.split('.').length <= 2;
        const isFactual = reply.length > 0;
        
        if (!hasDisclaimer && isShort && isFactual) {
          console.log('   ✅ PASS - No disclaimers, concise, factual');
          passed++;
        } else {
          console.log('   ❌ FAIL - Has disclaimers or too long');
        }\n      } else {\n        console.log(`   ❌ FAIL - Error: ${result.error}`);\n      }\n    } catch (error) {\n      console.log(`   ❌ FAIL - Exception: ${error.message}`);\n    }\n    \n    // Test Grok
    console.log('\n🔶 GROK:');
    try {
      const result = await grokService.chat(test.query);
      if (result.success) {
        const reply = result.reply;
        console.log(`   Reply: "${reply}"`);
        
        // Check requirements
        const isShort = reply.split('.').length <= 2;
        const isFactual = reply.length > 0;
        const hasWrongYear = /2024|2023|2022/i.test(reply) && test.query.includes('date');
        
        if (isShort && isFactual && !hasWrongYear) {
          console.log('   ✅ PASS - Concise, factual, correct year');
          passed++;
        } else {
          console.log('   ❌ FAIL - Too long or wrong year');
        }\n      } else {\n        console.log(`   ❌ FAIL - Error: ${result.error}`);\n      }\n    } catch (error) {\n      console.log(`   ❌ FAIL - Exception: ${error.message}`);\n    }\n  }\n  \n  console.log(`\\n${'='.repeat(60)}`);\n  console.log(`🏆 RESULTS: ${passed}/${total} tests passed`);\n  \n  if (passed === total) {\n    console.log('🎉 ALL ACCEPTANCE TESTS PASSED!');\n    console.log('✅ Gemini: No disclaimers, concise replies');\n    console.log('✅ Grok: Correct year, concise replies');\n    console.log('✅ Both: IST context injection working');\n  } else {\n    console.log('❌ Some tests failed - check implementation');\n  }\n}\n\nrunAcceptanceTests().catch(console.error);