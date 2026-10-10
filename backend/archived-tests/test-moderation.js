const { analyzeToxicity } = require('./src/services/toxicityService');
const { rephraseMessage } = require('./src/services/rephraseService');
const { getFallbackSuggestion } = require('./src/lib/fallbackFilter');

async function testModeration() {
  console.log('🧪 Testing AI Moderation System...\n');

  // Test messages
  const testMessages = [
    "Hello, how are you?",
    "You are stupid and ugly!",
    "I HATE YOU SO MUCH!!!",
    "That's a great idea, thanks!"
  ];

  for (const message of testMessages) {
    console.log(`📝 Testing: "${message}"`);
    
    // Test toxicity detection
    const toxicityResult = await analyzeToxicity(message);
    console.log(`   Toxicity: ${toxicityResult.ok ? toxicityResult.score.toFixed(3) : 'API Failed'}`);
    
    if (toxicityResult.ok && toxicityResult.score > 0.7) {
      // Test rephrasing
      const rephraseResult = await rephraseMessage(message);
      if (rephraseResult.ok) {
        console.log(`   Rephrased: "${rephraseResult.politeVersion}"`);
      } else {
        console.log(`   Rephrase failed, using fallback`);
      }
    }
    
    // Test fallback
    const fallback = getFallbackSuggestion(message);
    console.log(`   Fallback: ${fallback.isToxic ? 'TOXIC' : 'CLEAN'} - "${fallback.suggestion}"`);
    console.log('');
  }
}

// Run test if API keys are available
if (process.env.HUGGINGFACE_API_KEY && process.env.GEMINI_API_KEY) {
  testModeration().catch(console.error);
} else {
  console.log('❌ Missing API keys. Please set HUGGINGFACE_API_KEY and GEMINI_API_KEY in .env file');
}