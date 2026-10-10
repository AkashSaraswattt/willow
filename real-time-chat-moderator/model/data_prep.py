import pandas as pd
import re
from datasets import load_dataset

def clean_text(text):
    """Basic text cleaning"""
    if not isinstance(text, str):
        return ""
    
    # Lowercase
    text = text.lower()
    
    # Remove URLs
    text = re.sub(r'http\S+|www\S+', '', text)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def load_and_prepare_data(sample_size=10000):
    """
    Load toxicity dataset from HuggingFace
    Using civil_comments dataset as it's publicly available
    """
    print("Loading dataset...")
    dataset = load_dataset("civil_comments", split="train")
    
    # Sample for faster training
    if sample_size and sample_size < len(dataset):
        dataset = dataset.shuffle(seed=42).select(range(sample_size))
    
    print(f"Processing {len(dataset)} samples...")
    
    # Extract text and labels
    texts = []
    labels = []
    
    for item in dataset:
        text = clean_text(item['text'])
        if text:  # Skip empty texts
            texts.append(text)
            # Label as toxic if toxicity score > 0.5
            labels.append(1 if item['toxicity'] > 0.5 else 0)
    
    df = pd.DataFrame({
        'text': texts,
        'label': labels
    })
    
    # Balance dataset
    toxic_count = df['label'].sum()
    non_toxic_count = len(df) - toxic_count
    
    print(f"Toxic samples: {toxic_count}")
    print(f"Non-toxic samples: {non_toxic_count}")
    
    # Save processed data
    df.to_csv('artifacts/processed_data.csv', index=False)
    print("Data saved to artifacts/processed_data.csv")
    
    return df

if __name__ == "__main__":
    df = load_and_prepare_data(sample_size=10000)
    print(f"\nDataset shape: {df.shape}")
    print(f"Label distribution:\n{df['label'].value_counts()}")
