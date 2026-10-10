const { moderateWithGemini } = require('../services/geminiPoolService');
const { moderateWithGroq } = require('../services/groqService');

const getSuggestion = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text is required" });
    }

    const geminiResult = await moderateWithGemini(text, {
      perAttemptTimeoutMs: 4500,
      maxAttempts: 1
    });
    
    let suggestedText = text;
    let needsModeration = false;
    
    if (geminiResult.ok) {
      if (geminiResult.text === '<<BLOCK>>') {
        return res.json({ blocked: true });
      }
      
      if (geminiResult.text !== text) {
        suggestedText = geminiResult.text;
        needsModeration = true;
      }
    } else {
      // Fallback to Groq
      const groqResult = await moderateWithGroq(text, 3000);
      if (groqResult.ok) {
        if (groqResult.text === '<<BLOCK>>') {
          return res.json({ blocked: true });
        }
        
        if (groqResult.text !== text) {
          suggestedText = groqResult.text;
          needsModeration = true;
        }
      }
    }
    
    res.json({ 
      original: text,
      suggested: suggestedText,
      needsModeration
    });
    
  } catch (error) {
    console.error("Error in getSuggestion:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getSuggestion };