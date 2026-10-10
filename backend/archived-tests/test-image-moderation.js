const { extractTextFromImage } = require('./src/services/ocrService');
const { moderateWithGemini } = require('./src/services/geminiPoolService');
require('dotenv').config();

async function testImageModeration() {
  console.log('=== Testing Image Moderation Pipeline ===\n');

  // Test images
  const testImages = [
    {
      name: 'Clean text image',
      url: 'https://via.placeholder.com/400x200/FFFFFF/000000?text=Hello+World'
    },
    {
      name: 'Test image with text',
      url: 'https://via.placeholder.com/400x200/FF0000/FFFFFF?text=Test+Message'
    }
  ];

  for (const testImage of testImages) {
    console.log(`\n--- Testing: ${testImage.name} ---`);
    console.log(`URL: ${testImage.url}`);
    
    // Step 1: Extract text
    console.log('\n[1] Extracting text from image...');
    const ocrResult = await extractTextFromImage(testImage.url);
    
    if (!ocrResult.success) {
      console.log('❌ OCR Failed:', ocrResult.error || 'No text found');
      continue;
    }
    
    console.log('✅ OCR Success');
    console.log('Extracted text:', ocrResult.text);
    console.log('Text length:', ocrResult.text.length);
    
    // Step 2: Check minimum length
    if (ocrResult.text.length < 3) {
      console.log('⚠️  Text too short (< 3 chars), allowing image');
      continue;
    }
    
    // Step 3: Moderate with Gemini (round-robin)
    console.log('\n[2] Moderating text with Gemini...');
    const geminiResult = await moderateWithGemini(ocrResult.text, {
      perAttemptTimeoutMs: 4500,
      maxAttempts: 2
    });
    
    if (!geminiResult.ok) {
      console.log('❌ Gemini moderation failed:', geminiResult.reason);
      console.log('✅ ACTION: ALLOW IMAGE (moderation failed, fail-open)');
      continue;
    }
    
    console.log('✅ Gemini moderation complete');
    console.log('Result:', geminiResult.text);
    console.log('Key used:', geminiResult.keyIndex);
    
    // Step 4: Determine action
    if (geminiResult.text === '<<BLOCK>>') {
      console.log('🚫 ACTION: BLOCK IMAGE (toxic content detected)');
    } else {
      console.log('✅ ACTION: ALLOW IMAGE (content is safe)');
    }
  }
  
  console.log('\n=== Image Moderation Test Complete ===');
}

testImageModeration().catch(console.error);