const axios = require("axios");

async function analyzeToxicity(text) {
  console.log('Analyzing toxicity for:', text);
  console.log('HF_TOKEN exists:', !!process.env.HF_TOKEN);
  
  try {
    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/unitary/toxic-bert",
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    const predictions = response.data?.[0];
    if (!Array.isArray(predictions)) {
      return { ok: false, score: 0 };
    }

    console.log('HF Response:', JSON.stringify(response.data, null, 2));
    
    const toxic = predictions.find(p => p.label === "TOXIC" || p.label === "toxic");
    const score = toxic?.score || 0;
    
    console.log('Parsed toxic score:', score);

    return { ok: true, score };
  } catch (err) {
    console.error("Toxicity API error:", err.message);
    return { ok: false, score: 0 };
  }
}

module.exports = { analyzeToxicity };
