const FriendRequest = require('../models/friendRequest.model.js');
const User = require('../models/user.model.js');
const { getReceiverSocketId, io } = require('../lib/socket.js');

class FriendService {
  // Rate limiting map (in-memory for simplicity)
  static rateLimitMap = new Map();

  static checkRateLimit(userId) {
    const key = userId.toString();
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 5;

    if (!this.rateLimitMap.has(key)) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    const userData = this.rateLimitMap.get(key);
    if (now > userData.resetTime) {
      userData.count = 1;
      userData.resetTime = now + windowMs;
      return true;
    }

    if (userData.count >= maxRequests) {
      return false;
    }

    userData.count++;
    return true;
  }

  static async areAlreadyFriends(userId1, userId2) {
    const friendship = await FriendRequest.findOne({
      $or: [
        { requesterId: userId1, recipientId: userId2, status: 'accepted' },
        { requesterId: userId2, recipientId: userId1, status: 'accepted' }
      ]
    });
    return !!friendship;
  }

  static async hasPendingRequest(requesterId, recipientId) {
    const request = await FriendRequest.findOne({
      requesterId,
      recipientId,
      status: 'pending'
    });
    return !!request;
  }

  static async getFriendsList(userId) {
    const friendRequests = await FriendRequest.find({
      $or: [
        { requesterId: userId, status: 'accepted' },
        { recipientId: userId, status: 'accepted' }
      ]
    }).populate('requesterId recipientId', 'fullName profilePic email');

    return friendRequests.map(req => {
      const requesterIdStr = req.requesterId._id.toString();
      const recipientIdStr = req.recipientId._id.toString();
      const userIdStr = userId.toString();
      
      // Return the OTHER person (not the current user)
      const friend = userIdStr === requesterIdStr 
        ? req.recipientId   // User was requester, return recipient
        : req.requesterId;  // User was recipient, return requester
        
      return {
        _id: friend._id,
        fullName: friend.fullName,
        profilePic: friend.profilePic,
        email: friend.email
      };
    });
  }

  static emitToUser(userId, event, data) {
    const socketId = getReceiverSocketId(userId);
    if (socketId) {
      io.to(socketId).emit(event, data);
    }
  }
}

module.exports = FriendService;