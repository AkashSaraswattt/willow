# AI Chat System Demo Log

## Test Setup
```bash
# Environment variables configured:
GEMINI_KEYS=demo_key_1,demo_key_2
GROK_KEYS=demo_grok_key
WEATHER_API_KEY=demo_weather_key
AI_REQUEST_TIMEOUT_MS=6000
DEFAULT_WEATHER_LOCATION="Mumbai,IN"
```

## Test 1: Hello Message with Gemini
```bash
curl -X POST http://localhost:5001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"model":"gemini","conversationId":"demo1","userId":"demoUser","message":"hello"}'
```

**Expected Response:**
```json
{
  "success": true,
  "reply": "Hi! How can I help you today?"
}
```

**Server Logs:**
```
USER_MESSAGE_SAVED conv=demo1 user=demoUser
GEMINI_CALL key_index=0 timeout=6000ms
GEMINI_SUCCESS key_index=0
AI_MESSAGE_SAVED conv=demo1 model=gemini
```

**Database Documents Created:**

**AIMessages Collection:**
```javascript
// User message
{
  _id: ObjectId("..."),
  conversationId: "demo1",
  senderId: "demoUser",
  senderType: "user",
  model: "gemini",
  text: "hello",
  moderated: false,
  createdAt: ISODate("2024-01-15T10:30:00.000Z")
}

// AI reply
{
  _id: ObjectId("..."),
  conversationId: "demo1",
  senderType: "ai",
  model: "gemini",
  text: "Hi! How can I help you today?",
  moderated: false,
  createdAt: ISODate("2024-01-15T10:30:01.200Z")
}
```

## Test 2: Toxic Message (Pre-moderation Block)
```bash
curl -X POST http://localhost:5001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"model":"gemini","conversationId":"demo2","userId":"demoUser","message":"You are so stupid"}'
```

**Expected Response:**
```json
{
  "success": true,
  "reply": null,
  "moderation": {
    "blocked": true,
    "reason": "Message contains inappropriate content",
    "suggestion": "Please rephrase your message in a more respectful way."
  }
}
```

**Database Documents:**
```javascript
// User message (marked as moderated)
{
  _id: ObjectId("..."),
  conversationId: "demo2",
  senderId: "demoUser",
  senderType: "user",
  model: "gemini",
  text: "You are so stupid",
  moderated: true,
  moderationReason: "Message contains inappropriate content",
  createdAt: ISODate("2024-01-15T10:31:00.000Z")
}

// ModerationLogs Collection
{
  _id: ObjectId("..."),
  conversationId: "demo2",
  userId: "demoUser",
  originalMessage: "You are so stupid",
  action: "blocked",
  reason: "Message contains inappropriate content",
  suggestedAlternative: "Please rephrase your message in a more respectful way.",
  model: "gemini",
  createdAt: ISODate("2024-01-15T10:31:00.000Z")
}
```

## Test 3: Weather Request
```bash
curl -X POST http://localhost:5001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"model":"gemini","conversationId":"demo3","userId":"demoUser","message":"What is the weather today?"}'
```

**Server Logs:**
```
USER_MESSAGE_SAVED conv=demo3 user=demoUser
WEATHER_FETCHED: Clear, 28°C in Mumbai
GEMINI_CALL key_index=1 timeout=6000ms
GEMINI_SUCCESS key_index=1
AI_MESSAGE_SAVED conv=demo3 model=gemini
```

**Expected Response:**
```json
{
  "success": true,
  "reply": "It's currently clear and 28°C in Mumbai today."
}
```

## Test 4: Grok Unavailable (Graceful Fallback)
```bash
curl -X POST http://localhost:5001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"model":"grok","conversationId":"demo4","userId":"demoUser","message":"hello"}'
```

**Server Logs:**
```
USER_MESSAGE_SAVED conv=demo4 user=demoUser
GROK_CALL key_index=0 timeout=6000ms
GROK_ERROR key_index=0 error=connect ECONNREFUSED
GROK_CALL key_index=0 timeout=6000ms
GROK_ERROR key_index=0 error=connect ECONNREFUSED
```

**Expected Response:**
```json
{
  "success": false,
  "error": "AI unavailable",
  "fallback": "Please rephrase your message in a more respectful way."
}
```

## Key Features Demonstrated

✅ **Gemini Identity Echo Prevention**: System prompt injection prevents "I am Gemini" responses
✅ **Graceful Grok Fallback**: Returns structured error when provider unavailable
✅ **Message Persistence**: All user and AI messages saved to MongoDB
✅ **IST Context Injection**: Current India time included in AI context
✅ **Weather Integration**: Server-side weather API calls when requested
✅ **Pre-moderation**: Toxic messages blocked before AI processing
✅ **Key Pooling**: Round-robin key selection with retry logic
✅ **Comprehensive Logging**: All operations logged with key indices (not raw keys)

## Health Check
```bash
curl http://localhost:5001/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "database": "connected",
    "ai_chat": {
      "gemini_keys": "2 configured",
      "grok_keys": "1 configured",
      "weather_api": "configured"
    },
    "legacy_moderation": {
      "huggingface": "configured",
      "gemini": "configured"
    }
  }
}
```