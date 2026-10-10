import joblib
import os
from typing import Dict

class ModelServer:
    def __init__(self, model_path: str, vectorizer_path: str):
        self.model = None
        self.vectorizer = None
        self.load_model(model_path, vectorizer_path)
    
    def load_model(self, model_path: str, vectorizer_path: str):
        """Load trained model and vectorizer"""
        if os.path.exists(model_path) and os.path.exists(vectorizer_path):
            self.model = joblib.load(model_path)
            self.vectorizer = joblib.load(vectorizer_path)
            print(f"Model loaded from {model_path}")
        else:
            print(f"Warning: Model files not found. Train the model first.")
    
    def predict(self, text: str) -> Dict[str, float]:
        """
        Predict toxicity score for input text
        Returns: {"toxicity_score": float, "is_toxic": bool}
        """
        if not self.model or not self.vectorizer:
            return {"toxicity_score": 0.0, "is_toxic": False}
        
        # Vectorize input
        text_vectorized = self.vectorizer.transform([text])
        
        # Get probability of toxic class
        proba = self.model.predict_proba(text_vectorized)[0]
        toxicity_score = proba[1] if len(proba) > 1 else 0.0
        
        return {
            "toxicity_score": float(toxicity_score),
            "is_toxic": toxicity_score > 0.5
        }
