const mongoose = require('mongoose');

const aiMessageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  senderId: { type: String },
  senderType: { type: String, enum: ['user', 'ai', 'system'], required: true },
  model: { type: String, enum: ['gemini', 'grok'] },
  text: { type: String, required: true },
  moderated: { type: Boolean, default: false },
  moderationReason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AIMessage', aiMessageSchema);