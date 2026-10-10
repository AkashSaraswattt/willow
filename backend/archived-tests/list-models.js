const axios = require('axios');
require('dotenv').config();

async function listGeminiModels() {
  const keys = Object.keys(process.env).filter(k => k.startsWith('GEMINI_KEY_'));
  if (keys.length === 0) return;
  
  const apiKey = process.env[keys[0]];
  
  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { timeout: 10000 }
    );
    
    console.log('Available models:');
    response.data.models?.forEach(model => {
      console.log(`- ${model.name} (${model.displayName})`);
    });
  } catch (error) {
    console.log('ERROR:', error.response?.data || error.message);
  }
}

listGeminiModels();