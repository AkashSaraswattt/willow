// Test round-robin key selection logic
require('dotenv').config();

// Mock the geminiPoolService logic
const keys = [];
const meta = [];
let lastUsedIndex = -1;

// Load keys from env
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

// Test round-robin selection
function testRoundRobin() {
  console.log('\n=== Testing Round-Robin Key Selection ===');
  
  for (let attempt = 1; attempt <= 15; attempt++) {
    // Find usable keys (all are usable initially)
    const usableIndices = [];
    for (let i = 0; i < keys.length; i++) {
      if (meta[i].dailyUsed < 20) {
        usableIndices.push(i);
      }
    }
    
    // Current logic (BUGGY)
    const selectedKeys = [];
    const startIndex = (lastUsedIndex + 1) % keys.length;
    
    for (let i = 0; i < keys.length && selectedKeys.length < 2; i++) {
      const keyIndex = (startIndex + i) % keys.length;
      if (usableIndices.includes(keyIndex)) {
        selectedKeys.push(keyIndex);
      }
    }
    
    const selectedKey = selectedKeys[0];
    
    // Simulate successful use
    meta[selectedKey].dailyUsed++;
    lastUsedIndex = selectedKey;
    
    console.log(`Attempt ${attempt}: Selected key ${selectedKey}, lastUsedIndex=${lastUsedIndex}`);
  }
}

testRoundRobin();