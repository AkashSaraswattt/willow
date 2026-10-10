const mongoose = require('mongoose');

const blockedMessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  originalMessage: { type: String, required: true },
  reason: { type: String },
  suggestedMessage: { type: String },
  toxicityScore: { type: Number, default: 0 },
  moderationMethod: { type: String, enum: ['ai', 'fallback', 'gemini', 'groq', 'grok'], default: 'ai' },
  messageType: { type: String, enum: ['private', 'group'], default: 'private' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

blockedMessageSchema.index({ senderId: 1, createdAt: -1 });
blockedMessageSchema.index({ createdAt: -1 });
blockedMessageSchema.index({ groupId: 1 });

module.exports = mongoose.model('BlockedMessage', blockedMessageSchema, 'blocks');
