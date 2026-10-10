# Model Artifacts Directory

This directory will contain trained model files after running the training pipeline:

- `toxicity_model.pkl` - Trained Logistic Regression model
- `vectorizer.pkl` - TF-IDF vectorizer
- `processed_data.csv` - Preprocessed training data
- `metrics.csv` - Model evaluation metrics

## To Generate Artifacts

```bash
cd model
python data_prep.py
python train.py
python evaluate.py
```

## File Sizes (Approximate)

- Model: ~5-10 MB
- Vectorizer: ~20-30 MB
- Data: ~5-10 MB (for 10k samples)
