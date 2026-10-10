const AIMessage = require('../models/aiMessage.model.js');
const ModerationLog = require('../models/moderationLog.model.js');
const fallbackFilter = require('../lib/fallbackFilter.js');
const geminiService = require('../services/geminiService.js');
const grokService = require('../services/grokService.js');
const weatherService = require('../services/weatherService.js');

async function chat(req, res) {
  console.log('AI_CHAT_REQUEST:', req.body);
  let { model, conversationId, userId, message } = req.body;
  
  if (!model || !message) {
    console.log('AI_CHAT_ERROR: Missing fields');
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  if (!['gemini', 'grok'].includes(model)) {
    console.log('AI_CHAT_ERROR: Invalid model');
    return res.status(400).json({ success: false, error: 'Invalid model' });
  }

  // Auto-generate conversationId if not provided (for AI chats)
  if (!conversationId) {
    conversationId = `ai_${model}_${Date.now()}`;
  }
  
  // Auto-generate userId if not provided
  if (!userId) {
    userId = 'anonymous';
  }

  try {
    console.log(`AI_CHAT_START: model=${model} conv=${conversationId}`);
    
    // Save user message immediately
    const userMessage = new AIMessage({
      conversationId,
      senderId: userId,
      senderType: 'user',
      text: message,
      model
    });
    await userMessage.save();
    console.log(`USER_MESSAGE_SAVED`);

    // Pre-moderation check
    const moderationCheck = fallbackFilter.check(message);
    if (moderationCheck.blocked) {
      console.log('MESSAGE_BLOCKED:', moderationCheck.reasons);
      userMessage.moderated = true;
      userMessage.moderationReason = moderationCheck.message;
      await userMessage.save();

      await new ModerationLog({
        conversationId,
        userId,
        originalMessage: message,
        action: 'blocked',
        reason: moderationCheck.message,
        suggestedAlternative: fallbackFilter.suggest(message),
        model
      }).save();

      return res.json({
        success: true,
        reply: null,
        moderation: {
          blocked: true,
          reason: moderationCheck.message,
          suggestion: fallbackFilter.suggest(message)
        }
      });
    }

    // Call AI service with fallback chain
    let aiResult;
    console.log(`CALLING_AI_SERVICE: ${model}`);
    
    if (model === 'gemini') {
      // Try Gemini first
      aiResult = await geminiService.chat(message);
      
      // Fallback to Groq if Gemini fails
      if (!aiResult.success) {
        console.log('GEMINI_FAILED, trying Groq fallback');
        aiResult = await grokService.chat(message);
        if (aiResult.success) {
          aiResult.source = 'groq_fallback';
        }
      } else {
        aiResult.source = 'gemini';
      }
    } else {
      // For Grok model, try Groq first then Gemini
      aiResult = await grokService.chat(message);
      
      if (!aiResult.success) {
        console.log('GROQ_FAILED, trying Gemini fallback');
        aiResult = await geminiService.chat(message);
        if (aiResult.success) {
          aiResult.source = 'gemini_fallback';
        }
      } else {
        aiResult.source = 'groq';
      }
    }
    
    console.log('AI_SERVICE_RESULT:', aiResult);

    // Final fallback - send original message if all AI services fail
    if (!aiResult.success) {
      console.log('ALL_AI_FAILED, sending original message');
      aiResult = {
        success: true,
        reply: `I'm having trouble processing your request right now. Here's what you said: "${message}"`,
        source: 'direct_fallback'
      };
    }

    // Save AI reply
    const aiMessage = new AIMessage({
      conversationId,
      senderType: 'ai',
      model,
      text: aiResult.reply
    });
    await aiMessage.save();
    console.log(`AI_MESSAGE_SAVED`);

    res.json({
      success: true,
      reply: aiResult.reply,
      conversationId,
      source: aiResult.source
    });

  } catch (error) {
    console.error(`AI_CHAT_ERROR:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

module.exports = { chat };