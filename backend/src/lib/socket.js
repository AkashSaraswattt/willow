const { Server } = require('socket.io');
const http = require('http');
const express = require('express');
const { analyzeToxicity } = require('../services/toxicityService');
const { rephraseMessage } = require('../services/rephraseService');
const fallbackFilter = require('./fallbackFilter');
const ModerationLog = require('../models/moderationLog.model');
const BlockedMessage = require('../models/blockedMessage.model');
const GroupMember = require('../models/groupMember.model');
const GroupMessage = require('../models/groupMessage.model');
const { moderateWithGemini } = require('../services/geminiPoolService');
const { moderateWithGroq } = require('../services/groqService');
const cloudinary = require('./cloudinary');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? true 
      : ["http://localhost:5173"],
  },
});

function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

// AI Moderation function
const moderateMessage = async (messageData) => {
  const { text, senderId, receiverId } = messageData;
  
  if (!text || text.trim().length === 0) {
    return { allowed: true, originalMessage: messageData };
  }

  try {
    // Try AI toxicity detection first
    const toxicityResult = await analyzeToxicity(text);
    let moderationMethod = 'ai';
    let isToxic = false;
    let suggestion = text;
    let reason = 'Message approved';
    let toxicityScore = 0;

    if (toxicityResult.ok && toxicityResult.score > 0.5) {
      // Message is toxic, get AI rephrase
      const rephraseResult = await rephraseMessage(text);
      
      if (rephraseResult.ok) {
        isToxic = true;
        suggestion = rephraseResult.politeVersion;
        reason = rephraseResult.reason;
        toxicityScore = toxicityResult.score;
      } else {
        // AI rephrase failed, use fallback
        const fallback = fallbackFilter.getFallbackSuggestion(text);
        isToxic = fallback.isToxic;
        suggestion = fallback.suggestion;
        reason = fallback.reason;
        moderationMethod = 'fallback';
      }
    } else if (!toxicityResult.ok) {
      // AI detection failed, use fallback
      const fallback = fallbackFilter.getFallbackSuggestion(text);
      isToxic = fallback.isToxic;
      suggestion = fallback.suggestion;
      reason = fallback.reason;
      moderationMethod = 'fallback';
    }

    // Log moderation event
    await ModerationLog.create({
      senderId,
      receiverId,
      originalMessage: text,
      toxicityScore,
      action: isToxic ? 'blocked' : 'allowed',
      suggestedMessage: suggestion,
      reason,
      moderationMethod
    });

    return {
      allowed: !isToxic,
      originalMessage: messageData,
      suggestion,
      reason,
      toxicityScore
    };

  } catch (error) {
    console.error('Moderation error:', error);
    // On error, use fallback
    const fallback = fallbackFilter.getFallbackSuggestion(text);
    
    await ModerationLog.create({
      senderId,
      receiverId,
      originalMessage: text,
      action: fallback.isToxic ? 'blocked' : 'allowed',
      suggestedMessage: fallback.suggestion,
      reason: 'Moderation service error - used fallback',
      moderationMethod: 'fallback'
    });

    return {
      allowed: !fallback.isToxic,
      originalMessage: messageData,
      suggestion: fallback.suggestion,
      reason: fallback.reason
    };
  }
};

io.on("connection", async (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    socket.join(userId);
    
    // Auto-join all user's groups
    try {
      const memberships = await GroupMember.find({ userId }).select('groupId');
      memberships.forEach(m => {
        socket.join(`group_${m.groupId}`);
      });
    } catch (error) {
      console.error('Error auto-joining groups:', error);
    }
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle real-time message sending with moderation
  socket.on('send_message', async (messageData) => {
    console.log('Socket send_message received:', messageData.text);
    try {
      // Run AI moderation BEFORE any broadcast
      const toxicityResult = await analyzeToxicity(messageData.text);
      console.log('Socket AI result:', toxicityResult);
      
      if (toxicityResult.ok && toxicityResult.score >= 0.5) {
        // Message is toxic - get suggestion and block
        let suggestion = messageData.text;
        let reason = 'Message contains inappropriate content';
        
        try {
          const rephraseResult = await rephraseMessage(messageData.text);
          if (rephraseResult.ok) {
            suggestion = rephraseResult.politeVersion;
            reason = rephraseResult.reason;
          }
        } catch (e) {
          const fallback = fallbackFilter.getFallbackSuggestion(messageData.text);
          suggestion = fallback.suggestion;
          reason = fallback.reason;
        }
        
        // Increment toxic message count
        const User = require('../models/user.model');
        await User.findByIdAndUpdate(messageData.senderId, {
          $inc: { toxicMessageCount: 1 }
        });
        
        // Log moderation event
        console.log('[MODERATION] Creating blocked log for private message:', {
          senderId: messageData.senderId,
          receiverId: messageData.receiverId,
          action: 'blocked',
          method: 'ai'
        });
        await Promise.all([
          ModerationLog.create({
            senderId: messageData.senderId,
            receiverId: messageData.receiverId,
            originalMessage: messageData.text,
            suggestedMessage: suggestion,
            action: 'blocked',
            reason: reason,
            toxicityScore: toxicityResult.score,
            moderationMethod: 'ai',
            messageType: 'private'
          }),
          BlockedMessage.create({
            senderId: messageData.senderId,
            receiverId: messageData.receiverId,
            originalMessage: messageData.text,
            suggestedMessage: suggestion,
            reason: reason,
            toxicityScore: toxicityResult.score,
            moderationMethod: 'ai',
            messageType: 'private'
          })
        ]);
        console.log('[MODERATION] Blocked log created successfully');
        
        // Send blocked message ONLY to sender
        socket.emit('message_blocked', {
          original: messageData.text,
          suggestion: suggestion,
          reason: reason,
          source: 'ai'
        });
        return; // Stop here - do NOT broadcast
      }
      
      // Always check fallback filter regardless of AI result
      const fallback = fallbackFilter.analyzeFallback(messageData.text);
      if (fallback.isToxic) {
        // Increment toxic message count
        const User = require('../models/user.model');
        await User.findByIdAndUpdate(messageData.senderId, {
          $inc: { toxicMessageCount: 1 }
        });
        
        // Log moderation event
        console.log('[MODERATION] Creating blocked log for private message (fallback):', {
          senderId: messageData.senderId,
          receiverId: messageData.receiverId,
          action: 'blocked',
          method: !toxicityResult.ok ? 'fallback' : 'fallback_secondary'
        });
        const moderationMethod = !toxicityResult.ok ? 'fallback' : 'fallback';
        await Promise.all([
          ModerationLog.create({
            senderId: messageData.senderId,
            receiverId: messageData.receiverId,
            originalMessage: messageData.text,
            suggestedMessage: fallback.sanitized,
            action: 'blocked',
            reason: fallback.reasons.join(', '),
            moderationMethod: moderationMethod,
            messageType: 'private'
          }),
          BlockedMessage.create({
            senderId: messageData.senderId,
            receiverId: messageData.receiverId,
            originalMessage: messageData.text,
            suggestedMessage: fallback.sanitized,
            reason: fallback.reasons.join(', '),
            moderationMethod: moderationMethod,
            messageType: 'private'
          })
        ]);
        console.log('[MODERATION] Blocked log created successfully (fallback)');
        
        socket.emit('message_blocked', {
          original: messageData.text,
          suggestion: fallback.sanitized,
          reason: fallback.reasons.join(', '),
          source: !toxicityResult.ok ? 'fallback' : 'fallback_secondary'
        });
        return; // Stop here - do NOT broadcast
      }
      
      // Message is safe - broadcast to receiver directly
      const receiverSocketId = getReceiverSocketId(messageData.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_message', messageData);
      }
      
    } catch (error) {
      console.error('Socket message handling error:', error);
      socket.emit('message_error', { error: 'Failed to process message' });
    }
  });

  // Handle sending AI-suggested polite messages
  socket.on('send_suggested_message', (messageData) => {
    // Directly broadcast suggested message without moderation
    const receiverSocketId = getReceiverSocketId(messageData.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('new_message', messageData);
    }
  });

  // Handle message read status
  socket.on('mark_as_read', async ({ senderId, receiverId }) => {
    try {
      const Message = require('../models/message.model');
      await Message.updateMany(
        { senderId, receiverId, status: { $ne: 'read' } },
        { status: 'read' }
      );
      
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('messages_read', { userId: receiverId });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // GROUP CHAT FUNCTIONALITY
  
  // Join group room
  socket.on('group:join', async ({ groupId, userId }) => {
    try {
      // Verify membership
      const membership = await GroupMember.findOne({ groupId, userId });
      if (membership) {
        socket.join(`group_${groupId}`);
        console.log(`User ${userId} joined group room ${groupId}`);
        
        // Confirm join to client
        socket.emit('group:joined', { groupId });
      } else {
        socket.emit('group:join_error', { error: 'Not a group member' });
      }
    } catch (error) {
      console.error('Error joining group room:', error);
      socket.emit('group:join_error', { error: 'Failed to join group' });
    }
  });

  // Leave group room
  socket.on('group:leave', ({ groupId }) => {
    socket.leave(`group_${groupId}`);
    console.log(`User left group room ${groupId}`);
  });

  // Send group message with moderation
  socket.on('group:message:send', async (messageData) => {
    try {
      const { groupId, senderId, text, image } = messageData;
      const uid = String(senderId).slice(-4);

      // Verify membership
      const membership = await GroupMember.findOne({ groupId, userId: senderId });
      if (!membership) {
        socket.emit('group:message:error', { error: 'Not a group member' });
        return;
      }

      let finalText = text;
      let imageUrl = null;
      let wasBlocked = false;

      // Moderate text using SAME pipeline as private chat
      if (text && text.trim()) {
        const startTs = Date.now();
        const totalBudgetMs = 12000;
        
        // Stage 1: Try Gemini
        const geminiResult = await moderateWithGemini(text, {
          perAttemptTimeoutMs: 4500,
          maxAttempts: 2,
          remainingBudgetMs: totalBudgetMs - (Date.now() - startTs)
        });
        
        if (geminiResult.ok) {
          if (geminiResult.text === '<<BLOCK>>') {
            console.log(`GROUP_BLOCK uid=${uid} decision=BLOCK`);
            wasBlocked = true;
            
            // Log moderation
            await Promise.all([
              ModerationLog.create({
                senderId,
                groupId,
                originalMessage: text,
                action: 'blocked',
                reason: 'Inappropriate language detected',
                moderationMethod: 'gemini',
                messageType: 'group'
              }),
              BlockedMessage.create({
                senderId,
                groupId,
                originalMessage: text,
                reason: 'Inappropriate language detected',
                moderationMethod: 'gemini',
                messageType: 'group'
              })
            ]);
            
            // Increment toxic message count
            const User = require('../models/user.model');
            await User.findByIdAndUpdate(senderId, {
              $inc: { toxicMessageCount: 1 }
            });
            
            socket.emit('group:message:blocked', {
              original: text,
              reason: 'Message blocked due to inappropriate content'
            });
            return;
          }
          finalText = geminiResult.text;
          if (finalText !== text) {
            console.log(`GROUP_REWRITE_GEMINI uid=${uid} decision=REWRITE`);
            await ModerationLog.create({
              senderId,
              groupId,
              originalMessage: text,
              suggestedMessage: finalText,
              action: 'rephrased',
              moderationMethod: 'gemini',
              messageType: 'group'
            });
            socket.emit('group:message:rephrased', {
              original: text,
              rephrased: finalText
            });
          } else {
            console.log(`GROUP_SAFE uid=${uid} decision=SAFE`);
            await ModerationLog.create({
              senderId,
              groupId,
              originalMessage: text,
              action: 'allowed',
              moderationMethod: 'gemini',
              messageType: 'group'
            });
          }
        } else {
          // Stage 2: Fallback to Groq
          const groqResult = await moderateWithGroq(text, 3000);
          
          if (groqResult.ok) {
            if (groqResult.text === '<<BLOCK>>') {
              console.log(`GROUP_BLOCK_GROQ uid=${uid} decision=BLOCK`);
              wasBlocked = true;
              
              // Log moderation
              await Promise.all([
                ModerationLog.create({
                  senderId,
                  groupId,
                  originalMessage: text,
                  action: 'blocked',
                  reason: 'Inappropriate language detected',
                  moderationMethod: 'groq',
                  messageType: 'group'
                }),
                BlockedMessage.create({
                  senderId,
                  groupId,
                  originalMessage: text,
                  reason: 'Inappropriate language detected',
                  moderationMethod: 'groq',
                  messageType: 'group'
                })
              ]);
              
              // Increment toxic message count
              const User = require('../models/user.model');
              await User.findByIdAndUpdate(senderId, {
                $inc: { toxicMessageCount: 1 }
              });
              
              socket.emit('group:message:blocked', {
                original: text,
                reason: 'Message blocked due to inappropriate content'
              });
              return;
            }
            finalText = groqResult.text;
            if (finalText !== text) {
              console.log(`GROUP_REWRITE_GROQ uid=${uid} decision=REWRITE`);
              await ModerationLog.create({
                senderId,
                groupId,
                originalMessage: text,
                suggestedMessage: finalText,
                action: 'rephrased',
                moderationMethod: 'groq',
                messageType: 'group'
              });
              socket.emit('group:message:rephrased', {
                original: text,
                rephrased: finalText
              });
            } else {
              console.log(`GROUP_SAFE_GROQ uid=${uid} decision=SAFE`);
              await ModerationLog.create({
                senderId,
                groupId,
                originalMessage: text,
                action: 'allowed',
                moderationMethod: 'groq',
                messageType: 'group'
              });
            }
          } else {
            // Stage 3: Fail-open (use original text)
            console.log(`GROUP_FAIL_OPEN uid=${uid} decision=FAIL_OPEN`);
          }
        }
      }

      // Handle image upload
      if (image) {
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      }

      // Save message
      const groupMessage = new GroupMessage({
        groupId,
        senderId,
        text: finalText,
        image: imageUrl,
        status: 'delivered'
      });

      await groupMessage.save();
      await groupMessage.populate('senderId', 'username profilePic');

      // Mark as delivered for all group members except sender
      const members = await GroupMember.find({ groupId }).select('userId');
      const memberIds = members.map(m => m.userId.toString()).filter(id => id !== senderId.toString());
      
      // Broadcast to group room (including sender)
      io.to(`group_${groupId}`).emit('group:newMessage', {
        ...groupMessage.toObject(),
        deliveredTo: memberIds
      });
      
      // Update unread counts for offline members (like individual chat)
      memberIds.forEach(memberId => {
        const memberSocketId = getReceiverSocketId(memberId);
        if (memberSocketId) {
          // Member is online, message delivered
          io.to(memberSocketId).emit('group:unread_update', {
            groupId,
            increment: 1
          });
        }
      });
      
    } catch (error) {
      console.error('Group message error:', error);
      socket.emit('group:message:error', { error: 'Failed to send message' });
    }
  });

  // Handle group message read status
  socket.on('group:mark_as_read', async ({ groupId, userId }) => {
    try {
      // Mark all unread messages as read for this user
      await GroupMessage.updateMany(
        { 
          groupId, 
          senderId: { $ne: userId },
          'readBy.userId': { $ne: userId }
        },
        { 
          $push: { readBy: { userId, readAt: new Date() } }
        }
      );
      
      // Notify group members about read status
      io.to(`group_${groupId}`).emit('group:messages_read', { userId, groupId });
      
      // Update unread counts for the user who read messages
      const userSocketId = getReceiverSocketId(userId);
      if (userSocketId) {
        io.to(userSocketId).emit('group:unread_update', {
          groupId,
          reset: true
        });
      }
    } catch (error) {
      console.error('Error marking group messages as read:', error);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

module.exports = { io, app, server, getReceiverSocketId };