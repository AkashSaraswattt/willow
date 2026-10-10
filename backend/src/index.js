const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./lib/db.js');
const authRoutes = require('./routes/auth.route.js');
const messageRoutes = require('./routes/message.route.js');
const aiRoutes = require('./routes/ai.route.js');
const friendRoutes = require('./routes/friend.route.js');
const groupRoutes = require('./routes/group.routes.js');
const adminRoutes = require('./routes/admin.route.js');
const moderationRoutes = require('./routes/moderation.route.js');
const blockRoutes = require('./routes/block.route.js');
const { app, server } = require('./lib/socket.js');

dotenv.config();

const PORT = parseInt(process.env.PORT) || 5001;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' 
      ? true 
      : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    credentials: true,
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  const geminiKeys = Object.keys(process.env).filter(k => k.startsWith('GEMINI_KEY_')).length;
  const groqKey = process.env.GROQ_API_KEY ? 1 : 0;
  
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      ai_chat: {
        gemini_keys: geminiKeys > 0 ? `${geminiKeys} configured` : 'missing',
        groq_key: groqKey > 0 ? 'configured' : 'missing',
        weather_api: process.env.WEATHER_API_KEY ? 'configured' : 'missing'
      },
      legacy_moderation: {
        huggingface: process.env.HF_TOKEN ? 'configured' : 'missing',
        gemini: geminiKeys > 0 ? 'configured' : 'missing'
      }
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/users", friendRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/moderation", moderationRoutes);
app.use("/api/block", blockRoutes);

if (process.env.NODE_ENV === "production") {
  const distPath = path.resolve(__dirname, "../../dist");
  
  console.log('Looking for dist at:', distPath);
  
  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});