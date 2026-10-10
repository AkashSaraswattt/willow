# Sample Moderation Logs

## Test Case Results

### 1. Safe Message: "hello bro"
```
GEMINI_SUCCESS key=0 used=1/20 latency=1150ms
SAFE uid=a1b2 decision=SAFE
```

### 2. Mild Insult: "your iq is negative"  
```
GEMINI_SUCCESS key=1 used=1/20 latency=1340ms
REWRITE_GEMINI key=1 uid=c3d4 decision=REWRITE
```
**Rewritten to**: "I disagree with your perspective"

### 3. Direct Insult: "you are stupid idiot"
```
GEMINI_SUCCESS key=2 used=1/20 latency=980ms  
REWRITE_GEMINI key=2 uid=e5f6 decision=REWRITE
```
**Rewritten to**: "I think you're wrong about this"

### 4. Violent Threat: "I will kill you"
```
GEMINI_SUCCESS key=0 used=2/20 latency=1200ms
BLOCK uid=g7h8 decision=BLOCK
```
**HTTP Response**: 400 Bad Request
```json
{
  "error": "This message was blocked due to inappropriate language. Kindly communicate respectfully."
}
```

### 5. Explicit Abuse: "madarchod"
```
GEMINI_SUCCESS key=1 used=2/20 latency=1100ms
BLOCK uid=i9j0 decision=BLOCK  
```
**HTTP Response**: 400 Bad Request
```json
{
  "error": "This message was blocked due to inappropriate language. Kindly communicate respectfully."
}
```

## Key Exhaustion Scenario

### When Gemini Key Hits Rate Limit
```
GEMINI_429 key=0
GEMINI_SUCCESS key=1 used=3/20 latency=1450ms
REWRITE_GEMINI key=1 uid=k1l2 decision=REWRITE
```

### When All Gemini Keys Exhausted → Groq Fallback
```
GEMINI_429 key=0
GEMINI_429 key=1  
GEMINI_429 key=2
REWRITE_GROQ uid=m3n4 decision=REWRITE
```

### Complete Service Failure → Fail-Open
```
GEMINI_429 key=0
GEMINI_429 key=1
GEMINI_429 key=2
GROQ_ERROR: timeout of 3000ms exceeded
FAIL_OPEN uid=o5p6 decision=FAIL_OPEN
```

## Daily Reset Event
```
[2024-01-15 00:00:01] Daily counters reset - all keys restored
GEMINI_SUCCESS key=0 used=1/20 latency=1200ms
```

## Multi-Instance Coordination (Redis)
```
GEMINI_SUCCESS key=0 used=15/20 latency=1300ms (instance-1)
GEMINI_SUCCESS key=1 used=8/20 latency=1150ms (instance-2)  
GEMINI_429 key=0 (instance-1)
GEMINI_SUCCESS key=1 used=9/20 latency=1400ms (instance-1)
```