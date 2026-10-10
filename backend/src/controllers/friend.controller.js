const FriendRequest = require('../models/friendRequest.model.js');
const User = require('../models/user.model.js');
const FriendService = require('../services/friend.service.js');

const sendFriendRequest = async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    const requesterId = req.user._id;

    // Validate recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent self-requests
    if (requesterId.toString() === recipientId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    // Check rate limit
    if (!FriendService.checkRateLimit(requesterId)) {
      return res.status(429).json({ error: 'Too many requests. Please wait before sending more.' });
    }

    // Check if already friends
    if (await FriendService.areAlreadyFriends(requesterId, recipientId)) {
      return res.status(409).json({ error: 'Already friends with this user' });
    }

    // Check for existing pending request
    if (await FriendService.hasPendingRequest(requesterId, recipientId)) {
      return res.status(409).json({ error: 'Friend request already sent' });
    }

    // Create friend request
    const friendRequest = new FriendRequest({
      requesterId,
      recipientId,
      message: message || '',
      status: 'pending'
    });

    await friendRequest.save();
    await friendRequest.populate('requesterId', 'fullName profilePic email');

    // Emit real-time notification to recipient
    FriendService.emitToUser(recipientId, 'friend:request_sent', {
      request: {
        _id: friendRequest._id,
        requester: friendRequest.requesterId,
        message: friendRequest.message,
        createdAt: friendRequest.createdAt
      }
    });

    res.status(201).json({
      success: true,
      request: friendRequest
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const cancelFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.user._id;

    const request = await FriendRequest.findOneAndDelete({
      _id: requestId,
      requesterId: userId,
      status: 'pending'
    });

    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error cancelling friend request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const respondToFriendRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;
    const userId = req.user._id;

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const request = await FriendRequest.findOne({
      _id: requestId,
      recipientId: userId,
      status: 'pending'
    }).populate('requesterId', 'fullName profilePic email');

    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    request.status = action === 'accept' ? 'accepted' : 'rejected';
    request.updatedAt = new Date();
    await request.save();

    // Emit real-time update to requester
    FriendService.emitToUser(request.requesterId._id, 'friend:request_update', {
      requestId: request._id,
      status: request.status,
      recipient: {
        _id: req.user._id,
        fullName: req.user.fullName,
        profilePic: req.user.profilePic
      }
    });

    // If accepted, emit friend list updates to both users
    if (action === 'accept') {
      const requesterFriends = await FriendService.getFriendsList(request.requesterId._id);
      const recipientFriends = await FriendService.getFriendsList(userId);

      FriendService.emitToUser(request.requesterId._id, 'friends:list_updated', {
        friends: requesterFriends
      });

      FriendService.emitToUser(userId, 'friends:list_updated', {
        friends: recipientFriends
      });
    }

    res.json({
      success: true,
      status: request.status
    });
  } catch (error) {
    console.error('Error responding to friend request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSentRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await FriendRequest.find({
      requesterId: userId,
      status: 'pending'
    }).populate('recipientId', 'fullName profilePic email').sort({ createdAt: -1 });

    res.json({
      success: true,
      requests: requests.map(req => ({
        _id: req._id,
        recipient: req.recipientId,
        message: req.message,
        createdAt: req.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching sent requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getReceivedRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await FriendRequest.find({
      recipientId: userId,
      status: 'pending'
    }).populate('requesterId', 'fullName profilePic email').sort({ createdAt: -1 });

    res.json({
      success: true,
      requests: requests.map(req => ({
        _id: req._id,
        requester: req.requesterId,
        message: req.message,
        createdAt: req.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching received requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getFriendsList = async (req, res) => {
  try {
    const userId = req.user._id;
    const Message = require('../models/message.model.js');
    const friends = await FriendService.getFriendsList(userId);

    // Get unread counts and last message for each friend
    const friendsWithMetadata = await Promise.all(
      friends.map(async (friend) => {
        const unreadCount = await Message.countDocuments({
          senderId: friend._id,
          receiverId: userId,
          status: { $ne: 'read' }
        });
        
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: userId, receiverId: friend._id },
            { senderId: friend._id, receiverId: userId }
          ]
        }).sort({ createdAt: -1 });
        
        return {
          ...friend,
          unreadCount,
          lastMessageTime: lastMessage?.createdAt || new Date(0)
        };
      })
    );
    
    // Sort by last message time (most recent first)
    friendsWithMetadata.sort((a, b) => 
      new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    res.json({
      success: true,
      friends: friendsWithMetadata
    });
  } catch (error) {
    console.error('Error fetching friends list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q, limit = 10, offset = 0 } = req.query;
    const currentUserId = req.user._id;

    let users;
    
    if (!q || q.trim().length === 0) {
      // Return all users when no search query
      users = await User.find({
        _id: { $ne: currentUserId }
      })
      .select('fullName profilePic email')
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    } else if (q.trim().length < 2) {
      return res.json({ success: true, users: [] });
    } else {
      const searchQuery = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      users = await User.find({
        _id: { $ne: currentUserId },
        fullName: { $regex: searchQuery, $options: 'i' }
      })
      .select('fullName profilePic email')
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    }

    // Check friendship and pending request status for each user
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        const isFriend = await FriendService.areAlreadyFriends(currentUserId, user._id);
        const hasPending = await FriendService.hasPendingRequest(currentUserId, user._id);
        
        return {
          _id: user._id,
          fullName: user.fullName,
          profilePic: user.profilePic,
          email: user.email,
          isFriend,
          hasPendingRequest: hasPending
        };
      })
    );

    res.json({
      success: true,
      users: usersWithStatus
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  sendFriendRequest,
  cancelFriendRequest,
  respondToFriendRequest,
  getSentRequests,
  getReceivedRequests,
  getFriendsList,
  searchUsers
};