# Production-Grade Moderation Pipeline

## Overview
This implementation provides a robust, production-ready text moderation system with dynamic Gemini key pooling, Groq fallback, and fail-open behavior.

## Architecture

### Flow
1. **Text Messages Only**: Images bypass moderation entirely
2. **Gemini Pool**: Up to 2 attempts using different keys (4.5s timeout each)
3. **Groq Fallback**: Single attempt if Gemini fails (3s timeout)
4. **Fail-Open**: Use original text if all AI services fail

### Key Pool Management
- **Dynamic Loading**: Automatically detects `GEMINI_KEY_*` from environment
- **Daily Limits**: 20 requests per key per UTC day
- **Round-Robin**: Alternates between available keys
- **Rate Limit Handling**: Disables keys until next UTC midnight on HTTP 429
- **Atomic Operations**: Thread-safe counter management

### Configuration (.env)
```bash
# Gemini Key Pool (add as many as needed)
GEMINI_KEY_1=AIzaSyAAA...
GEMINI_KEY_2=AIzaSyBBB...
GEMINI_KEY_3=AIzaSyCCC...

# Groq Fallback
GROQ_API_KEY=gsk_your_groq_key_here
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
```

## Multi-Instance Deployment

For horizontal scaling, store pool metadata in Redis:

```javascript
// Redis-based pool state (production)
const redis = require('redis');
const client = redis.createClient();

// Store per-key metadata
await client.hset('gemini:meta', keyIndex, JSON.stringify({
  dailyUsed: 0,
  disabledUntil: null
}));

// Atomic increment
await client.hincrby('gemini:counters', keyIndex, 1);
```

## Logging Format

All moderation events use standardized logging:

```
GEMINI_SUCCESS key=0 used=5/20 latency=1200ms
GEMINI_429 key=1
GEMINI_ERROR key=2 err=timeout
REWRITE_GEMINI key=0 uid=a1b2 decision=REWRITE
REWRITE_GROQ uid=c3d4 decision=REWRITE
SAFE uid=e5f6 decision=SAFE
BLOCK uid=g7h8 decision=BLOCK
FAIL_OPEN uid=i9j0 decision=FAIL_OPEN
```

## Testing

Run the test suite:
```bash
cd backend
node test-new-pipeline.js
```

Expected test cases:
1. `"hello bro"` → SAFE (unchanged)
2. `"your iq is negative"` → REWRITE
3. `"you are stupid idiot"` → REWRITE  
4. `"I will kill you"` → BLOCK (HTTP 400)
5. `"madarchod"` → BLOCK (HTTP 400)

## Development Reset

To reset daily counters in development:
```bash
# Restart the server (counters are in-memory)
npm restart

# Or trigger UTC date change by modifying system time
```

## Production Considerations

- **Timeouts**: Total budget 12s (4.5s × 2 + 3s + buffer)
- **Concurrency**: Use Redis for multi-instance deployments
- **Monitoring**: Track key exhaustion and fallback rates
- **Alerting**: Monitor FAIL_OPEN events for service degradation