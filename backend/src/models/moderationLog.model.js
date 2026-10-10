const mongoose = require('mongoose');

const moderationLogSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  conversationId: { type: String },
  userId: { type: String },
  originalMessage: { type: String, required: true },
  action: { type: String, enum: ['blocked', 'rephrased', 'allowed', 'flagged', 'bypassed'], required: true },
  reason: { type: String },
  suggestedMessage: { type: String },
  suggestedAlternative: { type: String },
  toxicityScore: { type: Number, default: 0 },
  moderationMethod: { type: String, enum: ['ai', 'fallback', 'gemini', 'groq', 'grok', 'bypass'], default: 'ai' },
  model: { type: String },
  messageType: { type: String, enum: ['private', 'group'], default: 'private' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

moderationLogSchema.index({ senderId: 1, createdAt: -1 });
moderationLogSchema.index({ action: 1, createdAt: -1 });
moderationLogSchema.index({ groupId: 1 });

module.exports = mongoose.model('ModerationLog', moderationLogSchema);