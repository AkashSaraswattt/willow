import pandas as pd
import joblib
from sklearn.metrics import (
    accuracy_score, 
    precision_score, 
    recall_score, 
    f1_score,
    roc_auc_score,
    classification_report
)
import numpy as np

def evaluate_model():
    """Comprehensive model evaluation"""
    
    # Load model and vectorizer
    print("Loading model...")
    model = joblib.load('artifacts/toxicity_model.pkl')
    vectorizer = joblib.load('artifacts/vectorizer.pkl')
    
    # Load test data
    print("Loading test data...")
    df = pd.read_csv('artifacts/processed_data.csv')
    
    # Use last 20% as test set (same split as training)
    from sklearn.model_selection import train_test_split
    _, X_test, _, y_test = train_test_split(
        df['text'], 
        df['label'], 
        test_size=0.2, 
        random_state=42,
        stratify=df['label']
    )
    
    # Vectorize
    X_test_vec = vectorizer.transform(X_test)
    
    # Predictions
    y_pred = model.predict(X_test_vec)
    y_proba = model.predict_proba(X_test_vec)[:, 1]
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_proba)
    
    print("\n" + "="*50)
    print("MODEL EVALUATION METRICS")
    print("="*50)
    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1-Score:  {f1:.4f}")
    print(f"ROC-AUC:   {roc_auc:.4f}")
    print("="*50)
    
    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['Non-toxic', 'Toxic']))
    
    # Test on sample texts
    print("\n" + "="*50)
    print("SAMPLE PREDICTIONS")
    print("="*50)
    
    test_samples = [
        "You are an idiot and I hate you",
        "Have a great day!",
        "This is stupid and you're dumb",
        "Thank you for your help",
        "Go away, nobody likes you"
    ]
    
    for text in test_samples:
        text_vec = vectorizer.transform([text])
        proba = model.predict_proba(text_vec)[0][1]
        prediction = "TOXIC" if proba > 0.5 else "NON-TOXIC"
        print(f"\nText: {text}")
        print(f"Score: {proba:.4f} → {prediction}")
    
    # Save metrics
    metrics = {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1_score': f1,
        'roc_auc': roc_auc
    }
    
    pd.DataFrame([metrics]).to_csv('artifacts/metrics.csv', index=False)
    print("\nMetrics saved to artifacts/metrics.csv")
    
    return metrics

if __name__ == "__main__":
    evaluate_model()
