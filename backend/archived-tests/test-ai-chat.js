// Test AI Chat Endpoint
// Run with: node test-ai-chat.js

const axios = require('axios');

const testAiChat = async () => {
  try {
    console.log('Testing AI Chat Endpoint...');
    
    // Test data
    const testMessage = {
      model: 'gemini',
      message: 'Hello, how are you?'
    };

    // Make request (you'll need to add auth token in real usage)
    const response = await axios.post('http://localhost:5001/api/ai/chat', testMessage, {
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header when testing with real user
        // 'Authorization': 'Bearer your_jwt_token_here'
      }
    });

    console.log('✅ AI Response:', response.data.reply);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

// Run test
testAiChat();