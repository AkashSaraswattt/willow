const { moderateWithGemini } = require('./src/services/geminiPoolService');

async function testModeration() {
  console.log('Testing moderation with: "stupid do this task again"');
  
  const result = await moderateWithGemini('stupid do this task again');
  
  if (result.ok) {
    console.log('Original:', 'stupid do this task again');
    console.log('Moderated:', result.text);
    console.log('Was rephrased:', result.text !== 'stupid do this task again');
  } else {
    console.log('Moderation failed:', result.reason);
  }
}

testModeration().catch(console.error);