import os
from dotenv import load_dotenv

load_dotenv()

# Toxicity threshold (0-1)
TOXICITY_THRESHOLD = 0.7

# Model paths
MODEL_PATH = "../model/artifacts/toxicity_model.pkl"
VECTORIZER_PATH = "../model/artifacts/vectorizer.pkl"

# Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Server config
HOST = "0.0.0.0"
PORT = 8000
