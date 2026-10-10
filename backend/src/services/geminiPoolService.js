const axios = require('axios');

// Dynamic key loading from .env
const keys = [];
const meta = [];
let lastUsedIndex = -1;
let lastResetDate = null;
let isInitialized = false;

// Load GEMINI_KEY_* from process.env
function loadGeminiKeys() {
  keys.length = 0;
  meta.length = 0;
  
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('GEMINI_KEY_')) {
      const apiKey = process.env[key];
      if (apiKey && apiKey.trim()) {
        keys.push(apiKey.trim());
        meta.push({ dailyUsed: 0, disabledUntil: null, usable: true });
      }
    }
  });
  
  // Set random start index on first load
  if (!isInitialized && keys.length > 0) {
    lastUsedIndex = Math.floor(Math.random() * keys.length) - 1;
    isInitialized = true;
  }
}

// Reset daily counters if UTC date changed
function resetDailyCountersIfUTCDateChanged() {
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  if (lastResetDate !== currentDate) {
    meta.forEach(m => {
      m.dailyUsed = 0;
      m.disabledUntil = null;
      m.usable = true;
    });
    lastResetDate = currentDate;
  }
}

// System prompt
const SYSTEM_PROMPT = `You are a content moderation and rewriting assistant.

Your task is to analyze the USER MESSAGE and output ONE final message string.

Rules (STRICT):
1. If the message is SAFE (no toxicity, insults, hate, threats, or sexual explicit language),
   return the ORIGINAL message EXACTLY as written.
2. If the message is UNSAFE but can be rewritten:
   - Remove insults, threats, or abusive tone
   - Preserve the ORIGINAL INTENT and TASK REQUEST
   - For task requests with mild insults (like "stupid task"), rephrase to "please do this task" or "do this task again"
   - Keep the core action/request intact
   - Do NOT water it down into vague disagreement
   - Keep it natural and conversational
   - Limit to ONE short sentence (max 20 words)
3. If the message is an explicit violent threat or cannot be rewritten safely,
   return exactly:
   <<BLOCK>>

Examples:
- "stupid do this task again" → "please do this task again"
- "you idiot, fix this" → "please fix this"
- "damn it, help me" → "please help me"

Output rules:
- Output ONLY the final message text
- No explanations
- No JSON
- No markdown

USER MESSAGE:
"""
{{MESSAGE}}
"""`;

async function moderateWithGemini(text, options = {}) {
  const { perAttemptTimeoutMs = 4500, maxAttempts = 2 } = options;
  
  // Initialize if needed
  if (keys.length === 0) loadGeminiKeys();
  resetDailyCountersIfUTCDateChanged();
  
  // Find usable keys
  const now = Date.now();
  const usableIndices = [];
  
  for (let i = 0; i < keys.length; i++) {
    const m = meta[i];
    if (m.dailyUsed < 20 && (!m.disabledUntil || now > m.disabledUntil)) {
      usableIndices.push(i);
    }
  }
  
  if (usableIndices.length === 0) {
    return { ok: false, reason: 'ALL_GEMINI_EXHAUSTED' };
  }
  
  // Select up to maxAttempts keys in round-robin order
  const selectedKeys = [];
  const startIndex = (lastUsedIndex + 1) % keys.length;
  
  for (let i = 0; i < keys.length && selectedKeys.length < Math.min(maxAttempts, usableIndices.length); i++) {
    const keyIndex = (startIndex + i) % keys.length;
    if (usableIndices.includes(keyIndex)) {
      selectedKeys.push(keyIndex);
    }
  }
  
  // Try each selected key
  for (const keyIndex of selectedKeys) {
    const startTime = Date.now();
    
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keys[keyIndex]}`,
        {
          contents: [{ parts: [{ text: SYSTEM_PROMPT.replace('{{MESSAGE}}', text) }] }],
          generationConfig: { temperature: 0.0, maxOutputTokens: 128 }
        },
        { 
          timeout: perAttemptTimeoutMs,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      
      if (result) {
        // Success - increment counter and update lastUsedIndex
        meta[keyIndex].dailyUsed++;
        lastUsedIndex = keyIndex;
        
        const latency = Date.now() - startTime;
        console.log(`GEMINI_SUCCESS key=${keyIndex} used=${meta[keyIndex].dailyUsed}/20 latency=${latency}ms`);
        
        return { ok: true, text: result, keyIndex };
      }
      
    } catch (error) {
      if (error.response?.status === 429) {
        // Rate limit - mark key as disabled until next UTC midnight
        const nextMidnight = new Date();
        nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1);
        nextMidnight.setUTCHours(0, 0, 0, 0);
        
        meta[keyIndex].disabledUntil = nextMidnight.getTime();
        meta[keyIndex].usable = false;
        meta[keyIndex].dailyUsed++; // Count 429 as usage
        
        console.log(`GEMINI_429 key=${keyIndex}`);
        continue;
      }
      
      // Network/timeout/5xx error - don't increment counter
      console.log(`GEMINI_ERROR key=${keyIndex} err=${error.message}`);
      continue;
    }
  }
  
  return { ok: false, reason: 'ALL_GEMINI_FAILED' };
}

module.exports = { moderateWithGemini };