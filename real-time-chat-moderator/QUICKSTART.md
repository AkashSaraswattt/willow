# Quick Start Guide

## Prerequisites

- Python 3.8+
- pip
- Gemini API key (get from https://ai.google.dev/)

## Setup (5 minutes)

### 1. Train the Model

```bash
cd model
pip install -r requirements.txt
python data_prep.py
python train.py
python evaluate.py
```

This will:
- Download the Civil Comments dataset
- Train a TF-IDF + Logistic Regression model
- Save artifacts to `model/artifacts/`

### 2. Configure Backend

```bash
cd ../backend
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 3. Start Backend

```bash
pip install -r requirements.txt
python app.py
```

Backend will run on http://localhost:8000

### 4. Test Frontend

```bash
cd ../frontend
# Open index.html in browser or:
python -m http.server 8080
```

Visit http://localhost:8080

## Testing

```bash
cd tests
pip install -r requirements.txt
pytest test_api.py -v
```

## API Usage

### Moderate Text

```bash
curl -X POST http://localhost:8000/moderate \
  -H "Content-Type: application/json" \
  -d '{"text": "Your message here"}'
```

### Response

```json
{
  "original_text": "Your message here",
  "toxicity_score": 0.15,
  "is_toxic": false,
  "needs_rephrasing": false,
  "rephrased_text": null
}
```

## Troubleshooting

**Model not found error:**
- Run the training pipeline first (step 1)

**Gemini API error:**
- Check your API key in `.env`
- Verify API quota at https://ai.google.dev/

**CORS error in frontend:**
- Make sure backend is running
- Check API_URL in `frontend/main.js`

## Next Steps

- Read `docs/report.md` for technical details
- Review `docs/slides_outline.md` for presentation
- Customize threshold in `backend/config.py`
