// Quick test to verify chat setup
const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testChatSetup() {
  console.log('🔍 Testing Chat Setup...\n');
  
  try {
    // 1. Check health endpoint
    console.log('1. Checking server health...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running');
    console.log('   Database:', health.data.services.database);
    console.log('   AI Keys:', health.data.services.ai_chat.gemini_keys);
    console.log('');
    
    // 2. Check if you need to login
    console.log('2. To test chat functionality:');
    console.log('   - Make sure you are logged in to the app');
    console.log('   - Add at least one friend using the Discover page');
    console.log('   - Try sending a message to your friend');
    console.log('');
    
    console.log('3. Common issues:');
    console.log('   ❌ No friends added → You won\'t see anyone in chat list');
    console.log('   ❌ Backend not running → Messages won\'t send');
    console.log('   ❌ Frontend not running → Can\'t access the app');
    console.log('   ❌ Socket not connected → Real-time messages won\'t work');
    console.log('');
    
    console.log('4. Check browser console for errors:');
    console.log('   - Open DevTools (F12)');
    console.log('   - Look for socket connection errors');
    console.log('   - Look for API request failures');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  Backend server is not running!');
      console.log('   Run: cd backend && npm run dev');
    }
  }
}

testChatSetup();
