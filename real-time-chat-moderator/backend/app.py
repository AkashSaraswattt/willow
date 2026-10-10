from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from model_server import ModelServer
import config

app = FastAPI(title="Real-Time Chat Moderator")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize model server
model_server = ModelServer(config.MODEL_PATH, config.VECTORIZER_PATH)

# Initialize Gemini
if config.GEMINI_API_KEY:
    genai.configure(api_key=config.GEMINI_API_KEY)

class ModerateRequest(BaseModel):
    text: str

class ModerateResponse(BaseModel):
    original_text: str
    toxicity_score: float
    is_toxic: bool
    needs_rephrasing: bool
    rephrased_text: str = None

def rephrase_with_gemini(text: str) -> str:
    """Use Gemini to rephrase toxic content"""
    if not config.GEMINI_API_KEY:
        return None
    
    try:
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"""Rephrase the following message to be polite and respectful while keeping the core meaning:

Message: {text}

Provide only the rephrased version, nothing else."""
        
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini error: {e}")
        return None

@app.post("/moderate", response_model=ModerateResponse)
async def moderate_text(request: ModerateRequest):
    """
    Moderate input text using ML model and optionally rephrase with Gemini
    """
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    # Get toxicity score from ML model
    prediction = model_server.predict(request.text)
    toxicity_score = prediction["toxicity_score"]
    
    # Check if rephrasing is needed
    needs_rephrasing = toxicity_score >= config.TOXICITY_THRESHOLD
    rephrased_text = None
    
    if needs_rephrasing:
        rephrased_text = rephrase_with_gemini(request.text)
    
    return ModerateResponse(
        original_text=request.text,
        toxicity_score=toxicity_score,
        is_toxic=prediction["is_toxic"],
        needs_rephrasing=needs_rephrasing,
        rephrased_text=rephrased_text
    )

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "model_loaded": model_server.model is not None,
        "gemini_configured": bool(config.GEMINI_API_KEY)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=config.HOST, port=config.PORT)
