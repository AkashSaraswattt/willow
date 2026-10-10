const axios = require('axios');

async function testAIChat() {
  console.log('Testing AI Chat Endpoint...\n');

  // Test 1: Hello message with Gemini
  try {
    console.log('1. Testing Gemini hello message:');
    const response1 = await axios.post(`http://localhost:5001/api/ai/chat`, {
      model: 'gemini',
      conversationId: 'demo1',
      userId: 'demoUser',
      message: 'hello'
    });
    console.log('Response:', JSON.stringify(response1.data, null, 2));
  } catch (error) {
    console.log('Error:', error.response?.data || error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Grok test
  try {
    console.log('2. Testing Groq (via grok model):');
    const response2 = await axios.post(`http://localhost:5001/api/ai/chat`, {
      model: 'grok',
      conversationId: 'demo2',
      userId: 'demoUser',
      message: 'hello'
    });
    console.log('Response:', JSON.stringify(response2.data, null, 2));
  } catch (error) {
    console.log('Error:', error.response?.data || error.message);
  }
}

if (require.main === module) {
  testAIChat().catch(console.error);
}

module.exports = { testAIChat };