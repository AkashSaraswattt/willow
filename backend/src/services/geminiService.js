const axios = require('axios');

// Dynamic key loading from .env
const keys = [];
const meta = [];
let lastUsedIndex = -1;
let lastResetDate = null;

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
  console.log(`Loaded ${keys.length} Gemini keys`);
}

// Reset daily counters if UTC date changed
function resetDailyCountersIfUTCDateChanged() {
  const currentDate = new Date().toISOString().split('T')[0];
  if (lastResetDate !== currentDate) {
    meta.forEach(m => {
      m.dailyUsed = 0;
      m.disabledUntil = null;
      m.usable = true;
    });
    lastResetDate = currentDate;
  }
}

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
    console.log('GEMINI_ERROR: All keys exhausted');
    return { success: false, error: 'AI unavailable' };
  }
  
  // Select next key in round-robin
  const startIndex = (lastUsedIndex + 1) % keys.length;
  let selectedIndex = -1;
  
  for (let i = 0; i < keys.length; i++) {
    const keyIndex = (startIndex + i) % keys.length;
    if (usableIndices.includes(keyIndex)) {
      selectedIndex = keyIndex;
      break;
    }
  }
  
  const timeout = parseInt(process.env.AI_REQUEST_TIMEOUT_MS) || 4500;
  const systemPrompt = `You are a concise, confident assistant inside a chat application.
Do not mention that you are an AI or model.
For greetings like "hello" or "hi", respond with a friendly greeting and offer to help.
For date/time questions, use the current India date and time (IST) provided below as authoritative.
Answer factual questions directly.
Keep replies to at most 2 short sentences.

${getISTContext()}`;
  
  const payload = {
    contents: [{
      parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }]
    }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 150 }
  };

  const startTime = Date.now();
  
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keys[selectedIndex]}`,
      payload,
      { timeout, headers: { 'Content-Type': 'application/json' } }
    );
    
    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!reply) {
      console.log('GEMINI_ERROR: Empty response');
      return { success: false, error: 'AI unavailable' };
    }
    
    // Success - increment counter and update lastUsedIndex
    meta[selectedIndex].dailyUsed++;
    lastUsedIndex = selectedIndex;
    
    const latency = Date.now() - startTime;
    console.log(`GEMINI_SUCCESS key=${selectedIndex} used=${meta[selectedIndex].dailyUsed}/20 latency=${latency}ms`);
    return { success: true, reply };
    
  } catch (error) {
    if (error.response?.status === 429) {
      // Rate limit - mark key as disabled until next UTC midnight
      const nextMidnight = new Date();
      nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1);
      nextMidnight.setUTCHours(0, 0, 0, 0);
      
      meta[selectedIndex].disabledUntil = nextMidnight.getTime();
      meta[selectedIndex].usable = false;
      meta[selectedIndex].dailyUsed++;
      
      console.log(`GEMINI_429 key=${selectedIndex}`);
    } else {
      console.log(`GEMINI_ERROR key=${selectedIndex} err=${error.message}`);
    }
    
    return { success: false, error: 'AI unavailable' };
  }
}

module.exports = { chat };