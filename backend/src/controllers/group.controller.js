const Group = require('../models/group.model.js');
const GroupMember = require('../models/groupMember.model.js');
const GroupMessage = require('../models/groupMessage.model.js');
const User = require('../models/user.model.js');
const ModerationLog = require('../models/moderationLog.model.js');
const cloudinary = require('../lib/cloudinary.js');
const { getReceiverSocketId, io } = require('../lib/socket.js');
const { moderateWithGemini } = require('../services/geminiPoolService');
const { moderateWithGroq } = require('../services/groqService');
const { extractTextFromImage } = require('../services/ocrService');
const { generateGroupQR } = require('../services/qrService');

// Generate secure join code
const generateJoinCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const createGroup = async (req, res) => {
  try {
    let { name, avatar } = req.body;
    const ownerId = req.user._id;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Group name is required" });
    }

    // Upload avatar if provided
    let avatarUrl = null;
    if (avatar) {
      const uploadResponse = await cloudinary.uploader.upload(avatar);
      avatarUrl = uploadResponse.secure_url;
    }

    // Generate unique join code
    let joinCode;
    let isUnique = false;
    while (!isUnique) {
      joinCode = generateJoinCode();
      const existing = await Group.findOne({ joinCode });
      if (!existing) isUnique = true;
    }

    // Create group
    const group = new Group({
      name: name.trim(),
      avatar: avatarUrl,
      joinCode,
      ownerId
    });

    await group.save();

    // Add owner as member
    try {
      const ownerMember = new GroupMember({
        groupId: group._id,
        userId: ownerId,
        role: 'owner'
      });

      console.log('Creating owner member:', { groupId: group._id, userId: ownerId, role: 'owner' });
      const savedMember = await ownerMember.save();
      console.log('Owner member saved successfully:', savedMember);

      // Update member count to include owner
      await Group.findByIdAndUpdate(group._id, { memberCount: 1 });
      console.log('Member count updated to 1');

      // Join owner to group room via socket
      const ownerSocketId = getReceiverSocketId(ownerId);
      if (ownerSocketId) {
        const ownerSocket = io.sockets.sockets.get(ownerSocketId);
        if (ownerSocket) {
          ownerSocket.join(`group_${group._id}`);
          console.log(`Owner ${ownerId} joined group room ${group._id}`);
        }
      }
    } catch (memberError) {
      console.error('Error creating owner member:', memberError);
      // Delete the group if member creation fails
      await Group.findByIdAndDelete(group._id);
      return res.status(500).json({ error: "Failed to add owner to group" });
    }

    const qrResult = await generateGroupQR(joinCode);

    res.status(201).json({
      group: {
        _id: group._id,
        name: group.name,
        avatar: group.avatar,
        joinCode: group.joinCode,
        memberCount: group.memberCount,
        createdAt: group.createdAt
      },
      qrCode: qrResult.success ? qrResult.qrCode : null,
      joinUrl: qrResult.success ? qrResult.joinUrl : null
    });
  } catch (error) {
    console.error("Error in createGroup:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const joinGroup = async (req, res) => {
  try {
    const { joinCode } = req.body;
    const userId = req.user._id;

    if (!joinCode) {
      return res.status(400).json({ error: "Join code is required" });
    }

    // Find group
    const group = await Group.findOne({ joinCode: joinCode.toUpperCase(), isActive: true });
    if (!group) {
      return res.status(404).json({ error: "Invalid join code" });
    }

    // Check if already member
    const existingMember = await GroupMember.findOne({ groupId: group._id, userId });
    if (existingMember) {
      return res.status(400).json({ error: "You are already a member of this group" });
    }

    // Add as member
    const member = new GroupMember({
      groupId: group._id,
      userId,
      role: 'member'
    });

    await member.save();

    // Update member count
    await Group.findByIdAndUpdate(group._id, { $inc: { memberCount: 1 } });

    // Notify existing members
    const members = await GroupMember.find({ groupId: group._id }).populate('userId', 'username');
    const newMember = await User.findById(userId).select('username profilePic');
    
    members.forEach(member => {
      if (member.userId._id.toString() !== userId.toString()) {
        const socketId = getReceiverSocketId(member.userId._id);
        if (socketId) {
          io.to(socketId).emit('group:member_joined', {
            groupId: group._id,
            member: newMember
          });
        }
      }
    });

    res.status(200).json({
      message: "Successfully joined group",
      group: {
        _id: group._id,
        name: group.name,
        avatar: group.avatar,
        memberCount: group.memberCount + 1
      }
    });
  } catch (error) {
    console.error("Error in joinGroup:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const memberships = await GroupMember.find({ userId })
      .populate({
        path: 'groupId',
        match: { isActive: true },
        select: 'name avatar createdAt'
      })
      .sort({ createdAt: -1 });

    const groups = await Promise.all(
      memberships
        .filter(m => m.groupId)
        .map(async (m) => {
          const group = m.groupId.toObject();
          
          // Get actual member count and sync it
          const actualMemberCount = await GroupMember.countDocuments({ groupId: group._id });
          await Group.findByIdAndUpdate(group._id, { memberCount: actualMemberCount });
          
          // Get last message
          const lastMessage = await GroupMessage.findOne({ groupId: group._id })
            .sort({ createdAt: -1 })
            .populate('senderId', 'username');
          
          // Get unread count
          const unreadCount = await GroupMessage.countDocuments({
            groupId: group._id,
            senderId: { $ne: userId },
            'readBy.userId': { $ne: userId }
          });
          
          return {
            ...group,
            memberCount: actualMemberCount,
            role: m.role,
            joinedAt: m.joinedAt,
            lastMessage,
            unreadCount,
            lastActivity: lastMessage?.createdAt || group.createdAt
          };
        })
    );

    // Sort by last activity
    groups.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getUserGroups:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const membership = await GroupMember.findOne({ groupId, userId });
    if (!membership) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    const messages = await GroupMessage.find({ 
      groupId,
      deletedFor: { $ne: userId }
    })
      .populate('senderId', 'username profilePic')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json(messages.reverse());
  } catch (error) {
    console.error("Error in getGroupMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // Find membership
    const membership = await GroupMember.findOne({ groupId, userId });
    if (!membership) {
      return res.status(404).json({ error: "You are not a member of this group" });
    }

    // Check if owner
    if (membership.role === 'owner') {
      return res.status(400).json({ error: "Group owner cannot leave. Transfer ownership first." });
    }

    // Remove membership
    await GroupMember.findByIdAndDelete(membership._id);

    // Update member count
    await Group.findByIdAndUpdate(groupId, { $inc: { memberCount: -1 } });

    // Notify remaining members
    const members = await GroupMember.find({ groupId }).populate('userId', 'username');
    const leftMember = await User.findById(userId).select('username');
    
    members.forEach(member => {
      const socketId = getReceiverSocketId(member.userId._id);
      if (socketId) {
        io.to(socketId).emit('group:member_left', {
          groupId,
          member: leftMember
        });
      }
    });

    res.status(200).json({ message: "Successfully left group" });
  } catch (error) {
    console.error("Error in leaveGroup:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const removeMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberId } = req.body;
    const adminId = req.user._id;

    // Verify admin permissions
    const adminMembership = await GroupMember.findOne({ groupId, userId: adminId });
    if (!adminMembership || !['owner', 'admin'].includes(adminMembership.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    // Find target member
    const targetMembership = await GroupMember.findOne({ groupId, userId: memberId });
    if (!targetMembership) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Cannot remove owner
    if (targetMembership.role === 'owner') {
      return res.status(400).json({ error: "Cannot remove group owner" });
    }

    // Remove membership
    await GroupMember.findByIdAndDelete(targetMembership._id);

    // Update member count
    await Group.findByIdAndUpdate(groupId, { $inc: { memberCount: -1 } });

    // Notify removed member
    const removedSocketId = getReceiverSocketId(memberId);
    if (removedSocketId) {
      io.to(removedSocketId).emit('group:removed', { groupId });
    }

    // Notify remaining members
    const members = await GroupMember.find({ groupId }).populate('userId', 'username');
    const removedMember = await User.findById(memberId).select('username');
    
    members.forEach(member => {
      const socketId = getReceiverSocketId(member.userId._id);
      if (socketId) {
        io.to(socketId).emit('group:member_removed', {
          groupId,
          member: removedMember
        });
      }
    });

    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error in removeMember:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getGroupQR = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // Verify membership
    const membership = await GroupMember.findOne({ groupId, userId });
    if (!membership) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const qrResult = await generateGroupQR(group.joinCode);
    
    if (qrResult.success) {
      res.status(200).json({
        qrCode: qrResult.qrCode,
        joinUrl: qrResult.joinUrl,
        joinCode: group.joinCode
      });
    } else {
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  } catch (error) {
    console.error("Error in getGroupQR:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const sendGroupMessage = async (req, res) => {
  try {
    let { text, image, bypassModeration } = req.body;
    const { groupId } = req.params;
    const senderId = req.user._id;
    const uid = String(senderId).slice(-4);

    // Verify membership
    const membership = await GroupMember.findOne({ groupId, userId: senderId });
    if (!membership) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    // Skip moderation if bypassModeration is true (for pre-approved suggestions)
    if (bypassModeration && text && text.trim()) {
      // Log bypassed message
      console.log(`GROUP_BYPASS uid=${uid} decision=BYPASS`);
      await ModerationLog.create({
        senderId,
        groupId,
        originalMessage: req.body.text,
        action: 'bypassed',
        reason: 'Pre-approved suggestion',
        moderationMethod: 'bypass',
        messageType: 'group'
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
          console.log(`GROUP_BLOCK uid=${uid} decision=BLOCK`);
          
          // Log moderation and increment toxic count
          await ModerationLog.create({
            senderId,
            groupId,
            originalMessage: req.body.text,
            action: 'blocked',
            reason: 'Inappropriate language detected',
            moderationMethod: 'gemini',
            messageType: 'group'
          });
          await User.findByIdAndUpdate(senderId, { $inc: { toxicMessageCount: 1 } });
          
          return res.status(400).json({
            error: "This message was blocked due to inappropriate language. Kindly communicate respectfully."
          });
        }
        
        text = geminiResult.text;
        if (text !== req.body.text) {
          console.log(`GROUP_REWRITE_GEMINI key=${geminiResult.keyIndex} uid=${uid} decision=REWRITE`);
          await ModerationLog.create({
            senderId,
            groupId,
            originalMessage: req.body.text,
            suggestedMessage: text,
            action: 'rephrased',
            moderationMethod: 'gemini',
            messageType: 'group'
          });
        } else {
          console.log(`GROUP_SAFE uid=${uid} decision=SAFE`);
          await ModerationLog.create({
            senderId,
            groupId,
            originalMessage: req.body.text,
            action: 'allowed',
            moderationMethod: 'gemini',
            messageType: 'group'
          });
        }
      } else {
        // Stage 2: Fallback to Groq (3s timeout)
        const groqResult = await moderateWithGroq(text, 3000);
        
        if (groqResult.ok) {
          if (groqResult.text === '<<BLOCK>>') {
            console.log(`GROUP_BLOCK uid=${uid} decision=BLOCK`);
            
            await ModerationLog.create({
              senderId,
              groupId,
              originalMessage: req.body.text,
              action: 'blocked',
              reason: 'Inappropriate language detected',
              moderationMethod: 'groq',
              messageType: 'group'
            });
            await User.findByIdAndUpdate(senderId, { $inc: { toxicMessageCount: 1 } });
            
            return res.status(400).json({
              error: "This message was blocked due to inappropriate language. Kindly communicate respectfully."
            });
          }
          
          text = groqResult.text;
          if (text !== req.body.text) {
            console.log(`GROUP_REWRITE_GROQ uid=${uid} decision=REWRITE`);
            await ModerationLog.create({
              senderId,
              groupId,
              originalMessage: req.body.text,
              suggestedMessage: text,
              action: 'rephrased',
              moderationMethod: 'groq',
              messageType: 'group'
            });
          } else {
            console.log(`GROUP_SAFE uid=${uid} decision=SAFE`);
            await ModerationLog.create({
              senderId,
              groupId,
              originalMessage: req.body.text,
              action: 'allowed',
              moderationMethod: 'groq',
              messageType: 'group'
            });
          }
        } else {
          // Stage 3: Fail-open (use original text)
          console.log(`GROUP_FAIL_OPEN uid=${uid} decision=FAIL_OPEN`);
          text = req.body.text;
        }
      }
    }

    // Image moderation pipeline (same as private messages)
    let imageUrl;
    if (image) {
      try {
        // Upload image first to get URL for OCR
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
        
        // Extract text from image for moderation
        console.log(`GROUP_IMAGE_OCR uid=${uid} starting OCR extraction`);
        const ocrResult = await extractTextFromImage(imageUrl);
        
        if (ocrResult.success && ocrResult.text.length >= 3) {
          console.log(`GROUP_IMAGE_TEXT uid=${uid} extracted=${ocrResult.text.length} chars`);
          
          // Moderate extracted text using same pipeline as text messages
          const geminiResult = await moderateWithGemini(ocrResult.text, {
            perAttemptTimeoutMs: 4500,
            maxAttempts: 2
          });
          
          if (geminiResult.ok && geminiResult.text === '<<BLOCK>>') {
            console.log(`GROUP_IMAGE_BLOCK uid=${uid} decision=BLOCK_IMAGE`);
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
            console.log(`GROUP_IMAGE_SAFE uid=${uid} decision=ALLOW_IMAGE`);
          } else {
            // Fallback to Groq for image text moderation
            const groqResult = await moderateWithGroq(ocrResult.text, 3000);
            if (groqResult.ok && groqResult.text === '<<BLOCK>>') {
              console.log(`GROUP_IMAGE_BLOCK_GROQ uid=${uid} decision=BLOCK_IMAGE`);
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
              console.log(`GROUP_IMAGE_FAILOPEN uid=${uid} decision=ALLOW_IMAGE`);
            }
          }
        } else {
          console.log(`GROUP_IMAGE_NO_TEXT uid=${uid} decision=ALLOW_IMAGE`);
        }
      } catch (imageError) {
        console.log(`GROUP_IMAGE_ERROR uid=${uid} error=${imageError.message}`);
        // If image processing fails, still allow the message to be sent without image
        imageUrl = null;
      }
    }

    const newMessage = new GroupMessage({
      groupId,
      senderId,
      text,
      image: imageUrl,
    });

    await newMessage.save();
    await newMessage.populate('senderId', 'username profilePic');

    // Get all group members for broadcasting
    const members = await GroupMember.find({ groupId }).select('userId');
    
    // Broadcast to each member individually (more reliable than room-based)
    members.forEach(member => {
      const memberSocketId = getReceiverSocketId(member.userId.toString());
      if (memberSocketId) {
        io.to(memberSocketId).emit('group:newMessage', newMessage);
      }
    });
    
    // Also broadcast to group room as fallback
    io.to(`group_${groupId}`).emit('group:newMessage', newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendGroupMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteGroupMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { deleteType } = req.body;
    const userId = req.user._id;

    const message = await GroupMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    const membership = await GroupMember.findOne({ groupId: message.groupId, userId });
    if (!membership) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    if (deleteType === 'everyone') {
      if (message.senderId.toString() !== userId.toString()) {
        return res.status(403).json({ error: "You can only delete your own messages for everyone" });
      }
      message.deletedForEveryone = true;
      message.text = "This message was deleted";
      message.image = null;
      await message.save();
      
      const members = await GroupMember.find({ groupId: message.groupId }).select('userId');
      members.forEach(member => {
        const socketId = getReceiverSocketId(member.userId.toString());
        if (socketId) {
          io.to(socketId).emit("group:message_deleted", { messageId, deleteType: 'everyone' });
        }
      });
    } else {
      if (!message.deletedFor) {
        message.deletedFor = [];
      }
      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
        await message.save();
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in deleteGroupMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const membership = await GroupMember.findOne({ groupId, userId });
    if (!membership) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    const members = await GroupMember.find({ groupId })
      .populate('userId', 'username fullName profilePic')
      .sort({ role: 1, joinedAt: 1 });

    res.status(200).json(members);
  } catch (error) {
    console.error("Error in getGroupMembers:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createGroup,
  joinGroup,
  getUserGroups,
  getGroupMessages,
  sendGroupMessage,
  leaveGroup,
  removeMember,
  getGroupQR,
  deleteGroupMessage,
  getGroupMembers
};