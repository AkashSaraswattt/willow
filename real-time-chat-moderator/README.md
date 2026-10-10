# Real-Time Chat Moderator

A proof-of-concept content moderation system combining ML-based toxicity detection with LLM-based message rephrasing.

## Architecture

```
User Message → ML Classifier → Toxicity Score → Threshold Check → Gemini Rephrasing → Moderated Output
```

## Components

### Backend (FastAPI)
- `/moderate` endpoint: Accepts text, returns toxicity score and rephrased version if needed
- Integrates ML model and Gemini API

### ML Model
- TF-IDF + Logistic Regression classifier
- Trained on public toxicity dataset
- Returns probability score (0-1)

### Frontend
- Simple HTML/JS interface for testing
- Displays original message, toxicity score, and rephrased version

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Train Model
```bash
cd model
pip install -r requirements.txt
python data_prep.py
python train.py
python evaluate.py
```

### Frontend
```bash
cd frontend
# Open index.html in browser or serve with:
python -m http.server 8080
```

## Configuration

Edit `backend/config.py`:
- `TOXICITY_THRESHOLD`: Score above which rephrasing is triggered (default: 0.7)
- `GEMINI_API_KEY`: Your Gemini API key

## Testing

```bash
cd tests
pytest test_api.py
```

## Limitations

- ML model is a basic proof-of-concept, not production-grade
- Limited to English language
- Requires internet connection for Gemini API
- No rate limiting or authentication implemented
- Model may have false positives/negatives

## Production Considerations

This is a proof-of-concept. For production:
- Use more sophisticated models (BERT, RoBERTa)
- Implement proper error handling and logging
- Add authentication and rate limiting
- Use model serving infrastructure (TensorFlow Serving, TorchServe)
- Implement caching and load balancing
- Add comprehensive monitoring and alerting
