const axios = require('axios');

function getISTContext() {
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const options = {
    weekday: 'long',
    year: 'numeric', 
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  };
  return `Current India Date & Time (IST): ${istTime.toLocaleDateString('en-IN', options)}`;
}

async function chat(message, context = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.log('GROQ_ERROR: No API key configured');
    return { success: false, error: 'AI unavailable' };
  }
  
  const timeout = parseInt(process.env.AI_REQUEST_TIMEOUT_MS) || 6000;
  
  const systemPrompt = `You are Groq AI, a concise professional assistant.
For greetings like "hello" or "hi", respond with a friendly greeting and offer to help.
For date/time questions, use the current India date and time (IST) provided below as the only correct time reference.
Do not infer dates or years independently.
Keep replies to at most 2 short sentences.

${getISTContext()}`;
  
  const payload = {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    model: 'llama-3.1-8b-instant',
    max_tokens: 150,
    temperature: 0.7
  };

  try {
    console.log(`GROQ_CALL timeout=${timeout}ms`);
    
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      payload,
      { 
        timeout,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const reply = response.data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      console.log('GROQ_ERROR: Empty response');
      return { success: false, error: 'AI unavailable' };
    }
    
    console.log(`GROQ_SUCCESS: ${reply.substring(0, 50)}...`);
    return { success: true, reply };
    
  } catch (error) {
    console.log(`GROQ_ERROR: ${error.message}`);
    return { success: false, error: 'AI unavailable' };
  }
}

// Legacy function for backward compatibility
async function moderateAndRewrite(text) {
  const result = await chat(text);
  return { ok: result.success, text: result.reply, error: result.error };
}

module.exports = { chat, moderateAndRewrite };