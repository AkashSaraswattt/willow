# Backend - Chat App with AI Moderation

## AI Chat System

### Features
- Multi-provider AI chat (Gemini, Grok)
- Message persistence in MongoDB
- Pre-moderation with fallback filtering
- Context-aware responses (IST time, weather)
- Key pooling and graceful fallbacks
- Comprehensive logging

### API Endpoint
```
POST /api/ai/chat
{
  "model": "gemini|grok",
  "conversationId": "string",
  "userId": "string",
  "message": "string"
}
```

## Environment Variables

### Required for AI Chat
```bash
# AI Provider Keys (comma-separated for pooling)
GEMINI_KEYS=key1,key2,key3
GROK_KEYS=key1,key2

# AI Configuration
AI_REQUEST_TIMEOUT_MS=6000

# Weather API (optional)
WEATHER_API_KEY=your_openweather_key
DEFAULT_WEATHER_LOCATION="Mumbai,IN"
```

### Legacy Moderation (existing)
```bash
GEMINI_API_KEY=your_gemini_key
HUGGINGFACE_API_KEY=your_hf_key
```

## Testing

### Test AI Chat
```bash
node test-ai-chat-demo.js
```

### Test Legacy Moderation
```bash
node test-moderation.js
```

### Example Usage
```bash
curl -X POST http://localhost:5001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"model":"gemini","conversationId":"demo1","userId":"user1","message":"hello"}'
```

## Database Collections
- `aimessages`: User and AI conversation history
- `moderationlogs`: Blocked/flagged message records