# Willow - Safe chat starts here

A modern realtime chat application built with MERN stack featuring advanced ML-based toxicity detection with AI-powered content rephrasing, friend request system, and comprehensive user management.

**Live Demo**: [Try Willow Now](https://willow-3osi.onrender.com/)

**WillowAPI**: [Try It](https://willowapi-lj3e.onrender.com/)

## Features

- **Tech Stack**: MERN + Socket.io + TailwindCSS + DaisyUI
- **Authentication**: JWT-based auth with email OTP verification
- **Real-time Messaging**: Socket.io powered instant communication
- **Friend Request System**: Complete user discovery and friend management
- **Group Chat**: Create groups, join via QR codes, real-time group messaging
- **ML-Powered Moderation**: TF-IDF + Logistic Regression toxicity detection with AI rephrasing
- **Admin Dashboard**: Real-time monitoring, user management, and analytics
- **User Status**: Online/offline status tracking
- **Production Ready**: Optimized for deployment

## Admin Dashboard

### Access
- **URL**: `/admin` (auto-redirect after login)
- **Email**: admin@willow.in
- **Password**: Willow@17

### Features
- **Real-time Statistics**: Users, messages, moderation metrics with date range filtering
- **Interactive Charts**: User growth, status distribution, moderation activity
- **User Management**: Search, filter, block/unblock users with reasons
- **Bulk Operations**: Select and manage up to 100 users at once
- **Moderation Logs**: View all moderation events with filters
- **Export Reports**: CSV exports for users, blocked users, and moderation logs
- **Toxic Tracking**: Automatic toxic message counting and reset functionality

### Setup Admin
```bash
cd backend
node src/seeds/admin.seed.js
node src/seeds/migrate-users.js
```

See [ADMIN_DASHBOARD.md](ADMIN_DASHBOARD.md) for detailed documentation.

## Architecture Overview

### Backend Structure
```
backend/
├── src/
│   ├── controllers/        # Route handlers
│   ├── models/            # MongoDB schemas
│   ├── services/          # Business logic
│   ├── routes/            # API endpoints
│   ├── middleware/        # Authentication middleware
│   ├── lib/              # Utilities (socket, db, cloudinary)
│   └── index.js          # Server entry point
├── package.json
└── .env.example
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Route components
│   ├── store/            # Zustand state management
│   ├── lib/              # API utilities
│   └── App.jsx
├── package.json
└── vite.config.js
```

## Friend Request System

### Core Features
- **User Discovery**: Real-time user search functionality
- **Request Management**: Send, cancel, accept, and reject friend requests
- **Real-time Notifications**: Instant updates via Socket.io
- **Privacy Controls**: Chat access limited to friends only
- **Rate Limiting**: Spam prevention (5 requests per minute)

### Friend Request Workflow
1. User searches for other users in Discovery page
2. Sends friend request with optional message
3. Recipient receives real-time notification
4. Recipient can accept or reject the request
5. Upon acceptance, both users gain chat access

### API Endpoints

```bash
# Send friend request
POST /api/friends/request
Content-Type: application/json
{
  "recipientId": "user_id",
  "message": "Hi there!"
}

# Respond to friend request
POST /api/friends/request/respond
Content-Type: application/json
{
  "requestId": "request_id",
  "action": "accept"
}

# Get friends list
GET /api/friends/list

# Search users
GET /api/users/search?q=username
```

### Socket Events
- `friend:request_sent` - New friend request received
- `friend:request_update` - Request status changed
- `friends:list_updated` - Friend list modified

## Group Chat System

### Core Features
- **Group Creation**: Create groups with custom names and avatars
- **QR Code Joining**: Generate QR codes for easy group joining
- **Real-time Messaging**: Instant group communication via Socket.io
- **Role Management**: Owner/Admin/Member permissions
- **AI Moderation**: Same moderation pipeline as private messages
- **Member Management**: Add/remove members, leave groups

### Group Chat Workflow
1. User creates group with name and optional avatar
2. System generates unique 8-character join code
3. QR code generated for easy sharing
4. Members join via code or QR scan
5. Real-time messaging with full moderation

### API Endpoints

```bash
# Create group
POST /api/groups
Content-Type: application/json
{
  "name": "My Group",
  "avatar": "base64_image_data"
}

# Join group
POST /api/groups/join
Content-Type: application/json
{
  "joinCode": "ABC12345"
}

# Get user's groups
GET /api/groups/me

# Get group messages
GET /api/groups/:id/messages

# Get QR code
GET /api/groups/:id/qr

# Leave group
POST /api/groups/:id/leave
```

### Socket Events
- `group:join` - Join group room
- `group:leave` - Leave group room
- `group:message:send` - Send group message
- `group:newMessage` - New message received
- `group:message:blocked` - Message blocked by moderation
- `group:member_joined` - New member joined
- `group:member_left` - Member left group

## AI Moderation System

### Moderation Pipeline
1. **Message Interception**: All messages analyzed before delivery
2. **ML Toxicity Detection**: TF-IDF based text representation with Logistic Regression classifier produces real-time toxicity probability scores (lightweight, fast, well-suited for live chat)
3. **Agentic AI Rephrasing**: Gemini and Grok APIs intelligently rephrase toxic content while preserving intent
4. **Multi-Provider Fallback**: Groq API as secondary rephrasing service
5. **Image Moderation**: OCR text extraction from images with AI analysis
6. **Rule-based Protection**: Keyword filtering when AI services unavailable
7. **Audit Logging**: Complete moderation event tracking

### How It Works
- **Detection**: Machine learning model (TF-IDF + Logistic Regression) analyzes text and returns toxicity probability
- **Rephrasing**: If toxic, agentic AI services (Gemini/Grok) rewrite the message to be constructive
- **Delivery**: Clean or rephrased messages delivered in real-time via Socket.io

### Image Moderation Features
- **OCR Text Extraction**: Extracts text from uploaded images
- **Round-Robin Key Usage**: Uses Gemini API keys in rotation for image moderation
- **Automatic Cleanup**: Deletes blocked images from Cloudinary
- **Fail-Open Policy**: Allows images when moderation services are unavailable
- **Minimum Text Threshold**: Only moderates images with 3+ characters of text

### Socket Events
- `send_message` - Client sends message for moderation
- `newMessage` - Clean messages broadcasted to recipients
- `message_blocked` - Toxic messages blocked with suggestions
- `message_sent` - Message delivery confirmation
- `message_error` - Error handling for failed processing

## WillowAPI - Content Moderation Platform

Willow's moderation system is powered by **WillowAPI**, a standalone AI-powered content moderation platform with comprehensive web dashboard.

### Key Features
- **Multi-Provider AI**: Gemini (primary), Groq (fallback), rule-based filtering
- **Web Dashboard**: API key management, analytics, interactive documentation
- **Production Ready**: JWT auth, rate limiting, comprehensive logging
- **Live Demo**: [https://willowapi-lj3e.onrender.com/](https://willowapi-lj3e.onrender.com/)
- **Repository**: [https://github.com/Shivansh11956/WillowAPI](https://github.com/Shivansh11956/WillowAPI)

### Integration
Willow uses WillowAPI's moderation endpoint for real-time content filtering:
```bash
POST /api/v1/moderate
Authorization: Bearer <api_key>
Content-Type: application/json

{
  "text": "Message to moderate",
  "userId": "optional_user_id",
  "conversationId": "optional_conversation_id"
}
```

## Environment Configuration

### Required Environment Variables

```bash
# Database & Server
MONGODB_URI=your_mongodb_connection_string
PORT=5001
JWT_SECRET=your_jwt_secret_key

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Moderation APIs
GEMINI_KEY_1=your_gemini_key_1
GEMINI_KEY_2=your_gemini_key_2
GEMINI_KEY_3=your_gemini_key_3
GEMINI_API_KEY=your_primary_gemini_key
GROK_API_KEY=your_grok_key
GROQ_API_KEY=your_groq_key
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions

# Image Moderation (OCR)
OCR_API_KEY=your_ocr_api_key

# Email Authentication (Brevo)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender@domain.com
BREVO_SENDER_NAME=Willow

NODE_ENV=production
```

### API Key Setup
Get API keys from:
- [Google AI Studio](https://makersuite.google.com/app/apikey) - Gemini AI
- [Groq Console](https://console.groq.com/keys) - Groq AI
- [xAI Console](https://console.x.ai) - Grok AI
- [Brevo](https://www.brevo.com) - Email service
- [OCR.space](https://ocr.space/ocrapi) - OCR API

## Installation & Setup

### Install Dependencies
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Build Application
```bash
npm run build
```

### Development Mode
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

### Production Mode
```bash
npm start
```

## Health Check
Visit `http://localhost:5001/health` to verify database connectivity and AI API status.


## Deployment

### Supported Platforms
Render, Railway, Heroku, Vercel, AWS Amplify, DigitalOcean

### Quick Deploy to Render
1. Fork/clone repository to GitHub
2. Connect repository to Render
3. Set environment variables in Render dashboard
4. Deploy automatically on push

### Production Checklist
- Use MongoDB Atlas for database
- Configure CORS for your domain
- Set up SSL certificates (automatic on Render)
- Monitor AI API quotas and rate limits
- Set NODE_ENV=production
- Configure admin account via seed scripts
- Test health endpoint: `/health`

## Troubleshooting

**AI Service Failures**
- Application automatically falls back to rule-based filtering
- Check `/health` endpoint for API status
- Verify API keys are valid and have quota remaining

**Connection Issues**
- Ensure correct port configuration (default: 5001)
- Check firewall settings for WebSocket connections
- Verify Socket.io connection parameters
- Check CORS configuration for your domain

**Database Problems**
- Confirm MongoDB connection string format
- Check database permissions and network access
- Monitor connection pool status
- Verify MongoDB Atlas IP whitelist settings

**Email Delivery**
- Verify Brevo API key is valid
- Check spam folders for OTP emails
- Ensure sender email is verified in Brevo dashboard
- Monitor Brevo dashboard for delivery status and errors

**Moderation Issues**
- ML model runs locally (no external dependencies)
- AI rephrasing requires valid Gemini/Grok API keys
- Check moderation logs in admin dashboard
- Verify toxicity threshold settings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
