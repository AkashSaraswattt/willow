const axios = require('axios');

const OCR_API_KEY = process.env.OCR_API_KEY || 'K87973677788957';
const OCR_API_URL = 'https://api.ocr.space/parse/image';

async function extractTextFromImage(imageUrl) {
  try {
    const formData = new URLSearchParams();
    formData.append('url', imageUrl);
    formData.append('apikey', OCR_API_KEY);
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');

    const response = await axios.post(OCR_API_URL, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000
    });

    if (response.data?.ParsedResults?.[0]?.ParsedText) {
      const text = response.data.ParsedResults[0].ParsedText.trim();
      console.log('OCR_SUCCESS: Extracted text:', text);
      return { success: true, text };
    }

    if (response.data?.IsErroredOnProcessing) {
      console.log('OCR_ERROR: Processing failed -', response.data?.ErrorMessage?.[0] || 'Unknown error');
      return { success: false, text: '', error: response.data?.ErrorMessage?.[0] };
    }

    console.log('OCR_NO_TEXT: No text found in image');
    return { success: false, text: '' };
  } catch (error) {
    console.log('OCR_ERROR:', error.message);
    return { success: false, text: '', error: error.message };
  }
}

module.exports = { extractTextFromImage };