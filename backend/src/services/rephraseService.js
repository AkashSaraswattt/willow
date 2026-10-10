const { moderateWithGemini } = require('./geminiPoolService');
const { moderateAndRewrite } = require('./grokService');

const rephraseMessage = async (text) => {
  // Try Gemini first
  try {
    const result = await moderateWithGemini(text, { 
      perAttemptTimeoutMs: 4500, 
      maxAttempts: 2 
    });
    
    if (result.ok) {
      const response = result.text;
      
      if (response === '<<BLOCK>>') {
        return {
          ok: true,
          isToxic: true,
          politeVersion: 'Message cannot be sent as written.',
          reason: 'Content violates community guidelines',
          source: 'gemini'
        };
      }
      
      const wasRephrased = response.trim() !== text.trim();
      return {
        ok: true,
        isToxic: wasRephrased,
        politeVersion: response,
        reason: wasRephrased ? 'Message rephrased for politeness' : 'Message approved',
        source: 'gemini'
      };
    }
  } catch (error) {
    console.error('Gemini failed:', error.message);
  }
  
  // Fallback to Grok
  try {
    const grokResult = await moderateAndRewrite(text);
    if (grokResult.ok) {
      const wasRephrased = grokResult.text.trim() !== text.trim();
      return {
        ok: true,
        isToxic: wasRephrased,
        politeVersion: grokResult.text,
        reason: wasRephrased ? 'Message rephrased by fallback AI' : 'Message approved by fallback AI',
        source: 'grok'
      };
    }
  } catch (error) {
    console.error('Grok failed:', error.message);
  }
  
  // Final fallback - return original message
  return {
    ok: true,
    isToxic: false,
    politeVersion: text,
    reason: 'AI services unavailable - message sent as-is',
    source: 'original'
  };
};

module.exports = { rephraseMessage };