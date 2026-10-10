const axios = require('axios');

const SYSTEM_PROMPT = `You are a content moderation and rewriting assistant.

Your task is to analyze the USER MESSAGE and output ONE final message string.

Rules (STRICT):
1. If the message is SAFE (no toxicity, insults, hate, threats, or sexual explicit language),
   return the ORIGINAL message EXACTLY as written.
2. If the message is UNSAFE but can be rewritten:
   - Remove insults, threats, or abusive tone
   - Preserve the ORIGINAL INTENT and CONFRONTATIONAL MEANING
   - Do NOT water it down into vague disagreement
   - Keep it natural and conversational
   - Limit to ONE short sentence (max 20 words)
3. If the message is an explicit violent threat or cannot be rewritten safely,
   return exactly:
   <<BLOCK>>

Output rules:
- Output ONLY the final message text
- No explanations
- No JSON
- No markdown

USER MESSAGE:
"""
{{MESSAGE}}
"""`;

async function moderateWithGroq(text, timeoutMs = 3000) {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: SYSTEM_PROMPT.replace('{{MESSAGE}}', text) }],
        temperature: 0.0,
        max_tokens: 128
      },
      {
        timeout: timeoutMs,
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    let result = response.data?.choices?.[0]?.message?.content?.trim() || '';
    
    // Clean up Groq responses - extract final message only
    if (result.includes('Here\'s a rewritten version:')) {
      const lines = result.split('\n');
      const lastQuoted = lines.find(line => line.startsWith('"') && line.endsWith('"'));
      if (lastQuoted) {
        result = lastQuoted.slice(1, -1); // Remove quotes
      }
    }
    
    if (!result) {
      return { ok: false, error: 'EMPTY_RESPONSE' };
    }
    
    return { ok: true, text: result };
    
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

module.exports = { moderateWithGroq };