const User = require('../models/user.model.js');
const Message = require('../models/message.model.js');
const ModerationLog = require('../models/moderationLog.model.js');
const BlockedMessage = require('../models/blockedMessage.model.js');
const cloudinary = require('../lib/cloudinary.js');
const { getReceiverSocketId, io } = require('../lib/socket.js');
const { moderateWithGemini } = require('../services/geminiPoolService');
const { moderateWithGroq } = require('../services/groqService');
const { extractTextFromImage } = require('../services/ocrService');
const FriendService = require('../services/friend.service.js');
const Block = require('../models/block.model.js');

// HF disabled for LLM rewrite pipeline
// const { analyzeToxicity } = require('../services/toxicityService');
// const { analyzeFallback } = require('../lib/fallbackFilter');

const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    // Get friends list instead of all users
    const friends = await FriendService.getFriendsList(loggedInUserId);
    
    // Get unread counts and last message for each friend
    const friendsWithMetadata = await Promise.all(
      friends.map(async (friend) => {
        const unreadCount = await Message.countDocuments({
          senderId: friend._id,
          receiverId: loggedInUserId,
          status: { $ne: 'read' }
        });
        
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: loggedInUserId, receiverId: friend._id },
            { senderId: friend._id, receiverId: loggedInUserId }
          ]
        }).sort({ createdAt: -1 });
        
        return {
          ...friend.toObject(),
          unreadCount,
          lastMessageTime: lastMessage?.createdAt || friend.createdAt
        };
      })
    );
    
    // Sort by last message time (most recent first)
    friendsWithMetadata.sort((a, b) => 
      new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );
    
    res.status(200).json(friendsWithMetadata);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const areFriends = await FriendService.areAlreadyFriends(myId, userToChatId);
    if (!areFriends) {
      return res.status(403).json({ error: "You can only chat with friends" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      deletedFor: { $ne: myId }
    });

    await Message.updateMany(
      { senderId: userToChatId, receiverId: myId, status: { $ne: 'read' } },
      { status: 'read' }
    );

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const sendMessage = async (req, res) => {
  try {
    let { text, image, bypassModeration } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const uid = String(senderId).slice(-4);

    // Check if users are friends
    const areFriends = await FriendService.areAlreadyFriends(senderId, receiverId);
    if (!areFriends) {
      return res.status(403).json({ error: "You can only send messages to friends" });
    }

    // Check if either user has blocked the other
    const [iBlockedThem, theyBlockedMe] = await Promise.all([
      Block.findOne({ blockerId: senderId, blockedId: receiverId }),
      Block.findOne({ blockerId: receiverId, blockedId: senderId })
    ]);

    if (iBlockedThem || theyBlockedMe) {
      return res.status(403).json({ error: "Cannot send message. Communication is blocked." });
    }

    // Skip moderation if bypassModeration is true (for pre-approved suggestions)
    if (bypassModeration && text && text.trim()) {
      // Log bypassed message
      console.log(`BYPASS uid=${uid} decision=BYPASS`);
      await ModerationLog.create({
        senderId,
        receiverId,
        originalMessage: req.body.text,
        action: 'bypassed',
        reason: 'Pre-approved suggestion',
        moderationMethod: 'bypass',
        messageType: 'private'
      });
    } else if (text && text.trim()) {
      const startTs = Date.now();
      const totalBudgetMs = 12000;
      
      // Stage 1: Try Gemini (max 2 attempts, 4.5s each)
      const geminiResult = await moderateWithGemini(text, {
        perAttemptTimeoutMs: 4500,
        maxAttempts: 2,
        remainingBudgetMs: totalBudgetMs - (Date.now() - startTs)
      });
      
      if (geminiResult.ok) {
        if (geminiResult.text === '<<BLOCK>>') {
          console.log(`BLOCK uid=${uid} decision=BLOCK`);
          
          // Log moderation and increment toxic count
          console.log('[MODERATION] Creating BLOCKED log entry');
          await Promise.all([
            ModerationLog.create({
              senderId,
              receiverId,
              originalMessage: req.body.text,
              action: 'blocked',
              reason: 'Inappropriate language detected',
              moderationMethod: 'gemini',
              messageType: 'private'
            }),
            BlockedMessage.create({
              senderId,
              receiverId,
              originalMessage: req.body.text,
              reason: 'Inappropriate language detected',
              moderationMethod: 'gemini',
              messageType: 'private'
            }),
            User.findByIdAndUpdate(senderId, { $inc: { toxicMessageCount: 1 } })
          ]);
          console.log('[MODERATION] BLOCKED log created successfully');
          
          return res.status(400).json({
            error: "This message was blocked due to inappropriate language. Kindly communicate respectfully."
          });
        }
        
        text = geminiResult.text;
        if (text !== req.body.text) {
          console.log(`REWRITE_GEMINI key=${geminiResult.keyIndex} uid=${uid} decision=REWRITE`);
          console.log('[MODERATION] Creating REPHRASED log entry');
          await ModerationLog.create({
            senderId,
            receiverId,
            originalMessage: req.body.text,
            suggestedMessage: text,
            action: 'rephrased',
            moderationMethod: 'gemini',
            messageType: 'private'
          });
          console.log('[MODERATION] REPHRASED log created successfully');
        } else {
          console.log(`SAFE uid=${uid} decision=SAFE`);
          console.log('[MODERATION] Creating ALLOWED log entry');
          await ModerationLog.create({
            senderId,
            receiverId,
            originalMessage: req.body.text,
            action: 'allowed',
            moderationMethod: 'gemini',
            messageType: 'private'
          });
          console.log('[MODERATION] ALLOWED log created successfully');
        }
      } else {
        // Stage 2: Fallback to Groq (3s timeout)
        const groqResult = await moderateWithGroq(text, 3000);
        
        if (groqResult.ok) {
          if (groqResult.text === '<<BLOCK>>') {
            console.log(`BLOCK uid=${uid} decision=BLOCK`);
            
            await Promise.all([
              ModerationLog.create({
                senderId,
                receiverId,
                originalMessage: req.body.text,
                action: 'blocked',
                reason: 'Inappropriate language detected',
                moderationMethod: 'groq',
                messageType: 'private'
              }),
              BlockedMessage.create({
                senderId,
                receiverId,
                originalMessage: req.body.text,
                reason: 'Inappropriate language detected',
                moderationMethod: 'groq',
                messageType: 'private'
              }),
              User.findByIdAndUpdate(senderId, { $inc: { toxicMessageCount: 1 } })
            ]);
            
            return res.status(400).json({
              error: "This message was blocked due to inappropriate language. Kindly communicate respectfully."
            });
          }
          
          text = groqResult.text;
          if (text !== req.body.text) {
            console.log(`REWRITE_GROQ uid=${uid} decision=REWRITE`);
            await ModerationLog.create({
              senderId,
              receiverId,
              originalMessage: req.body.text,
              suggestedMessage: text,
              action: 'rephrased',
              moderationMethod: 'groq',
              messageType: 'private'
            });
          } else {
            console.log(`SAFE uid=${uid} decision=SAFE`);
            await ModerationLog.create({
              senderId,
              receiverId,
              originalMessage: req.body.text,
              action: 'allowed',
              moderationMethod: 'groq',
              messageType: 'private'
            });
          }
        } else {
          // Stage 3: Fail-open (use original text)
          console.log(`FAIL_OPEN uid=${uid} decision=FAIL_OPEN`);
          text = req.body.text;
        }
      }
    }

    // Image moderation pipeline
    let imageUrl;
    if (image) {
      try {
        // Upload image first to get URL for OCR
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
        
        // Extract text from image for moderation
        console.log(`IMAGE_OCR uid=${uid} starting OCR extraction`);
        const ocrResult = await extractTextFromImage(imageUrl);
        
        if (ocrResult.success && ocrResult.text.length >= 3) {
          console.log(`IMAGE_TEXT uid=${uid} extracted=${ocrResult.text.length} chars`);
          
          // Moderate extracted text using same pipeline as text messages
          const geminiResult = await moderateWithGemini(ocrResult.text, {
            perAttemptTimeoutMs: 4500,
            maxAttempts: 2
          });
          
          if (geminiResult.ok && geminiResult.text === '<<BLOCK>>') {
            console.log(`IMAGE_BLOCK uid=${uid} decision=BLOCK_IMAGE`);
            // Delete uploaded image from cloudinary
            try {
              const publicId = imageUrl.split('/').pop().split('.')[0];
              await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
              console.log('Failed to delete blocked image:', deleteError.message);
            }
            
            return res.status(400).json({
              error: "This image was blocked due to inappropriate content. Please share appropriate images only."
            });
          } else if (geminiResult.ok) {
            console.log(`IMAGE_SAFE uid=${uid} decision=ALLOW_IMAGE`);
          } else {
            // Fallback to Groq for image text moderation
            const groqResult = await moderateWithGroq(ocrResult.text, 3000);
            if (groqResult.ok && groqResult.text === '<<BLOCK>>') {
              console.log(`IMAGE_BLOCK_GROQ uid=${uid} decision=BLOCK_IMAGE`);
              try {
                const publicId = imageUrl.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
              } catch (deleteError) {
                console.log('Failed to delete blocked image:', deleteError.message);
              }
              
              return res.status(400).json({
                error: "This image was blocked due to inappropriate content. Please share appropriate images only."
              });
            } else {
              console.log(`IMAGE_FAILOPEN uid=${uid} decision=ALLOW_IMAGE`);
            }
          }
        } else {
          console.log(`IMAGE_NO_TEXT uid=${uid} decision=ALLOW_IMAGE`);
        }
      } catch (imageError) {
        console.log(`IMAGE_ERROR uid=${uid} error=${imageError.message}`);
        // If image processing fails, still allow the message to be sent without image
        imageUrl = null;
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // Set status to delivered if receiver is online
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      newMessage.status = 'delivered';
      await newMessage.save();
      io.to(receiverSocketId).emit("new_message", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { deleteType } = req.body;
    const userId = req.user._id;

    console.log('Delete message request:', { messageId, deleteType, userId: userId.toString() });

    const message = await Message.findById(messageId);
    if (!message) {
      console.log('Message not found:', messageId);
      return res.status(404).json({ error: "Message not found" });
    }

    if (deleteType === 'everyone') {
      if (message.senderId.toString() !== userId.toString()) {
        return res.status(403).json({ error: "You can only delete your own messages for everyone" });
      }
      message.deletedForEveryone = true;
      message.text = "This message was deleted";
      message.image = null;
      await message.save();
      
      const receiverSocketId = getReceiverSocketId(message.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("message_deleted", { messageId, deleteType: 'everyone' });
      }
    } else {
      if (!message.deletedFor) {
        message.deletedFor = [];
      }
      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
        await message.save();
      }
    }

    console.log('Message deleted successfully');
    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in deleteMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getUsersForSidebar, getMessages, sendMessage, deleteMessage };
