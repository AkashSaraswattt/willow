const API_URL = 'http://localhost:8000';

async function moderateMessage() {
    const messageInput = document.getElementById('messageInput');
    const moderateBtn = document.getElementById('moderateBtn');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const error = document.getElementById('error');
    
    const text = messageInput.value.trim();
    
    if (!text) {
        showError('Please enter a message to moderate');
        return;
    }
    
    // Reset UI
    result.classList.remove('show', 'safe', 'warning', 'toxic');
    error.classList.remove('show');
    loading.classList.add('show');
    moderateBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/moderate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        displayResult(data);
        
    } catch (err) {
        showError(`Error: ${err.message}. Make sure the backend is running on ${API_URL}`);
    } finally {
        loading.classList.remove('show');
        moderateBtn.disabled = false;
    }
}

function displayResult(data) {
    const result = document.getElementById('result');
    const resultTitle = document.getElementById('resultTitle');
    const toxicityScore = document.getElementById('toxicityScore');
    const classification = document.getElementById('classification');
    const rephrasedContainer = document.getElementById('rephrasedContainer');
    const rephrasedText = document.getElementById('rephrasedText');
    
    // Determine severity
    let severity = 'safe';
    let title = '✅ Message is Safe';
    
    if (data.toxicity_score >= 0.7) {
        severity = 'toxic';
        title = '🚫 High Toxicity Detected';
    } else if (data.toxicity_score >= 0.4) {
        severity = 'warning';
        title = '⚠️ Moderate Toxicity Detected';
    }
    
    // Update UI
    result.className = `result show ${severity}`;
    resultTitle.textContent = title;
    toxicityScore.textContent = `${(data.toxicity_score * 100).toFixed(1)}%`;
    classification.textContent = data.is_toxic ? 'Toxic' : 'Non-toxic';
    
    // Show rephrased version if available
    if (data.rephrased_text) {
        rephrasedContainer.style.display = 'block';
        rephrasedText.textContent = data.rephrased_text;
    } else {
        rephrasedContainer.style.display = 'none';
    }
}

function showError(message) {
    const error = document.getElementById('error');
    error.textContent = message;
    error.classList.add('show');
}

// Allow Enter key to submit (with Shift+Enter for new line)
document.getElementById('messageInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        moderateMessage();
    }
});
