import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import app

client = TestClient(app)

def test_health_check():
    """Test health endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "ok"

def test_moderate_empty_text():
    """Test moderation with empty text"""
    response = client.post("/moderate", json={"text": ""})
    assert response.status_code == 400

def test_moderate_safe_text():
    """Test moderation with safe text"""
    response = client.post("/moderate", json={"text": "Hello, how are you?"})
    assert response.status_code == 200
    data = response.json()
    assert "toxicity_score" in data
    assert "is_toxic" in data
    assert data["toxicity_score"] < 0.5

def test_moderate_toxic_text():
    """Test moderation with potentially toxic text"""
    response = client.post("/moderate", json={"text": "You are stupid and I hate you"})
    assert response.status_code == 200
    data = response.json()
    assert "toxicity_score" in data
    assert "is_toxic" in data
    # Note: Actual toxicity depends on model training

def test_response_structure():
    """Test response has all required fields"""
    response = client.post("/moderate", json={"text": "Test message"})
    assert response.status_code == 200
    data = response.json()
    
    required_fields = [
        "original_text",
        "toxicity_score",
        "is_toxic",
        "needs_rephrasing"
    ]
    
    for field in required_fields:
        assert field in data

def test_toxicity_score_range():
    """Test toxicity score is between 0 and 1"""
    response = client.post("/moderate", json={"text": "This is a test"})
    assert response.status_code == 200
    data = response.json()
    assert 0 <= data["toxicity_score"] <= 1

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
