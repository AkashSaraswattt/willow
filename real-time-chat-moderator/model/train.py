import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
import os

def train_model():
    """Train TF-IDF + Logistic Regression classifier"""
    
    # Load processed data
    print("Loading data...")
    df = pd.read_csv('artifacts/processed_data.csv')
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        df['text'], 
        df['label'], 
        test_size=0.2, 
        random_state=42,
        stratify=df['label']
    )
    
    print(f"Training samples: {len(X_train)}")
    print(f"Test samples: {len(X_test)}")
    
    # Create TF-IDF vectorizer
    print("\nVectorizing text...")
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.95
    )
    
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    # Train Logistic Regression
    print("Training model...")
    model = LogisticRegression(
        max_iter=1000,
        class_weight='balanced',
        random_state=42
    )
    
    model.fit(X_train_vec, y_train)
    
    # Evaluate
    print("\nEvaluating model...")
    train_score = model.score(X_train_vec, y_train)
    test_score = model.score(X_test_vec, y_test)
    
    print(f"Training accuracy: {train_score:.4f}")
    print(f"Test accuracy: {test_score:.4f}")
    
    # Predictions
    y_pred = model.predict(X_test_vec)
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Non-toxic', 'Toxic']))
    
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    # Save model and vectorizer
    print("\nSaving model...")
    joblib.dump(model, 'artifacts/toxicity_model.pkl')
    joblib.dump(vectorizer, 'artifacts/vectorizer.pkl')
    
    print("Model saved to artifacts/")
    
    return model, vectorizer, test_score

if __name__ == "__main__":
    os.makedirs('artifacts', exist_ok=True)
    train_model()
