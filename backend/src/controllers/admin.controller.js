const User = require('../models/user.model');
const Message = require('../models/message.model');
const GroupMessage = require('../models/groupMessage.model');
const ModerationLog = require('../models/moderationLog.model');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.getDashboardStats = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const totalMessages = await Message.countDocuments();
    const totalGroupMessages = await GroupMessage.countDocuments();
    
    const totalBlocked = await ModerationLog.countDocuments({ action: 'blocked' });
    const totalRephrased = await ModerationLog.countDocuments({ action: 'rephrased' });
    const totalAllowed = await ModerationLog.countDocuments({ action: 'allowed' });
    const totalModerated = await ModerationLog.countDocuments();
    
    const blockedInRange = await ModerationLog.countDocuments({ 
      action: 'blocked',
      createdAt: { $gte: startDate }
    });
    
    const usersWithToxicMessages = await User.countDocuments({ 
      isAdmin: false, 
      toxicMessageCount: { $gt: 0 } 
    });
    
    const topToxicUsers = await User.find({ 
      isAdmin: false, 
      toxicMessageCount: { $gt: 0 } 
    })
      .select('email fullName toxicMessageCount isBlocked')
      .sort({ toxicMessageCount: -1 })
      .limit(5);
    
    const recentBlocks = await User.find({ isBlocked: true })
      .sort({ blockedAt: -1 })
      .limit(5)
      .select('email fullName blockedReason blockedAt');
    
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate }, isAdmin: false } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Fill missing dates with 0
    const userGrowthMap = Object.fromEntries(userGrowth.map(d => [d._id, d.count]));
    const filledUserGrowth = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      filledUserGrowth.push({ _id: dateStr, count: userGrowthMap[dateStr] || 0 });
    }
    
    const moderationStats = await ModerationLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          blocked: { $sum: { $cond: [{ $eq: ['$action', 'blocked'] }, 1, 0] } },
          rephrased: { $sum: { $cond: [{ $in: ['$action', ['rephrased', 'bypassed']] }, 1, 0] } },
          allowed: { $sum: { $cond: [{ $eq: ['$action', 'allowed'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Fill missing dates with 0
    const moderationStatsMap = Object.fromEntries(moderationStats.map(d => [d._id, d]));
    const filledModerationStats = [];
    const todayMod = new Date();
    todayMod.setHours(0, 0, 0, 0);
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(todayMod);
      date.setDate(date.getDate() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const existing = moderationStatsMap[dateStr];
      filledModerationStats.push({
        _id: dateStr,
        blocked: existing?.blocked || 0,
        rephrased: existing?.rephrased || 0,
        allowed: existing?.allowed || 0
      });
    }
    
    const moderationMethodStats = await ModerationLog.aggregate([
      {
        $group: {
          _id: '$moderationMethod',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const activeUsers24h = await User.countDocuments({
      isAdmin: false,
      updatedAt: { $gte: oneDayAgo }
    });
    const messages24h = await Message.countDocuments({
      createdAt: { $gte: oneDayAgo }
    }) + await GroupMessage.countDocuments({
      createdAt: { $gte: oneDayAgo }
    });
    
    res.json({
      stats: {
        totalUsers,
        blockedUsers,
        totalMessages: totalMessages + totalGroupMessages,
        totalModerated,
        totalBlocked,
        totalRephrased,
        totalAllowed,
        usersWithToxicMessages,
        blockedInRange,
        activeUsers24h,
        messages24h
      },
      recentBlocks,
      topToxicUsers,
      userGrowth: filledUserGrowth,
      moderationStats: filledModerationStats,
      moderationMethodStats,
      dateRange: { days, startDate, endDate: new Date() }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const filter = req.query.filter || 'all';
    
    const query = { isAdmin: false };
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (filter === 'blocked') {
      query.isBlocked = true;
    } else if (filter === 'toxic') {
      query.toxicMessageCount = { $gte: 5 };
    }
    
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ toxicMessageCount: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    res.json({
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      {
        isBlocked: true,
        blockedReason: reason || 'Toxic behavior',
        blockedAt: new Date()
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User blocked successfully', user });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      userId,
      {
        isBlocked: false,
        blockedReason: '',
        blockedAt: null
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User unblocked successfully', user });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const messageCount = await Message.countDocuments({
      $or: [{ senderId: userId }, { receiverId: userId }]
    });
    
    const groupMessageCount = await GroupMessage.countDocuments({ senderId: userId });
    
    const blockedCount = await ModerationLog.countDocuments({ 
      senderId: userId, 
      action: 'blocked' 
    });
    const rephrasedCount = await ModerationLog.countDocuments({ 
      senderId: userId, 
      action: 'rephrased' 
    });
    
    const moderationLogs = await ModerationLog.find({ senderId: userId })
      .populate('receiverId', 'email fullName profilePic')
      .populate('groupId', 'name')
      .sort({ createdAt: -1 })
      .limit(20);
    
    const FriendRequest = require('../models/friendRequest.model');
    const friendCount = await FriendRequest.countDocuments({
      $or: [{ requesterId: userId }, { recipientId: userId }],
      status: 'accepted'
    });
    
    res.json({
      user,
      messageCount: messageCount + groupMessageCount,
      blockedCount,
      rephrasedCount,
      friendCount,
      moderationLogs
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};

exports.exportReport = async (req, res) => {
  try {
    const { type } = req.query;
    
    if (type === 'users') {
      const users = await User.find({ isAdmin: false }).select('-password');
      const csv = [
        'Email,Full Name,Toxic Count,Blocked,Created At',
        ...users.map(u => 
          `${u.email},${u.fullName},${u.toxicMessageCount},${u.isBlocked},${u.createdAt}`
        )
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="users_report.csv"');
      return res.send(csv);
    }
    
    if (type === 'blocked') {
      const users = await User.find({ isBlocked: true }).select('-password');
      const csv = [
        'Email,Full Name,Reason,Blocked At',
        ...users.map(u => 
          `${u.email},${u.fullName},${u.blockedReason},${u.blockedAt}`
        )
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="blocked_users_report.csv"');
      return res.send(csv);
    }
    
    if (type === 'moderation') {
      const logs = await ModerationLog.find()
        .sort({ createdAt: -1 })
        .limit(1000)
        .lean();
      
      // Manually fetch user data to avoid populate errors
      const senderIds = [...new Set(logs.map(l => l.senderId).filter(Boolean))];
      const receiverIds = [...new Set(logs.map(l => l.receiverId).filter(Boolean))];
      
      const senders = await User.find({ _id: { $in: senderIds } }).select('email fullName').lean();
      const receivers = await User.find({ _id: { $in: receiverIds } }).select('email fullName').lean();
      
      const senderMap = Object.fromEntries(senders.map(u => [u._id.toString(), u]));
      const receiverMap = Object.fromEntries(receivers.map(u => [u._id.toString(), u]));
      
      const csv = [
        'Sender Email,Receiver Email,Action,Reason,Original Message,Suggested Message,Moderation Method,Message Type,Created At',
        ...logs.map(l => {
          const sender = senderMap[l.senderId?.toString()];
          const receiver = receiverMap[l.receiverId?.toString()];
          const senderEmail = sender?.email || 'Unknown';
          const receiverEmail = receiver?.email || (l.groupId ? 'Group' : 'Unknown');
          const originalMsg = (l.originalMessage || '').replace(/,/g, ';').replace(/\n/g, ' ');
          const suggestedMsg = (l.suggestedMessage || '').replace(/,/g, ';').replace(/\n/g, ' ');
          const reason = (l.reason || '').replace(/,/g, ';');
          return `${senderEmail},${receiverEmail},${l.action},${reason},${originalMsg},${suggestedMsg},${l.moderationMethod || 'unknown'},${l.messageType || 'private'},${l.createdAt}`;
        })
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="moderation_report.csv"');
      return res.send(csv);
    }
    
    res.status(400).json({ error: 'Invalid report type' });
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({ error: 'Failed to export report' });
  }
};

exports.getModerationLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const filter = req.query.filter || 'all';
    const userId = req.query.userId;
    
    const query = {};
    
    if (filter !== 'all') {
      query.action = filter;
    }
    
    if (userId) {
      query.senderId = userId;
    }
    
    const total = await ModerationLog.countDocuments(query);
    
    const logs = await ModerationLog.find(query)
      .populate('senderId', 'email fullName profilePic')
      .populate('receiverId', 'email fullName profilePic')
      .populate('groupId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    res.json({
      logs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching moderation logs:', error);
    res.status(500).json({ error: 'Failed to fetch moderation logs' });
  }
};

exports.syncToxicCounts = async (req, res) => {
  try {
    const blockedCounts = await ModerationLog.aggregate([
      { $match: { action: 'blocked' } },
      {
        $group: {
          _id: '$senderId',
          count: { $sum: 1 }
        }
      }
    ]);
    
    let updated = 0;
    for (const item of blockedCounts) {
      if (item._id) {
        await User.findByIdAndUpdate(item._id, {
          toxicMessageCount: item.count
        });
        updated++;
      }
    }
    
    res.json({ 
      message: `Toxic counts synced for ${updated} users`,
      updated 
    });
  } catch (error) {
    console.error('Error syncing toxic counts:', error);
    res.status(500).json({ error: 'Failed to sync toxic counts' });
  }
};

exports.bulkBlockUsers = async (req, res) => {
  try {
    const { userIds, reason } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'Please select at least one user' });
    }
    
    if (userIds.length > 100) {
      return res.status(400).json({ 
        error: `Cannot bulk block more than 100 users at once (${userIds.length} selected)` 
      });
    }
    
    const invalidIds = userIds.filter(id => !isValidObjectId(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ 
        error: `Invalid user IDs provided: ${invalidIds.slice(0, 3).join(', ')}${invalidIds.length > 3 ? '...' : ''}` 
      });
    }
    
    const adminCount = await User.countDocuments({ 
      _id: { $in: userIds }, 
      isAdmin: true 
    });
    
    if (adminCount > 0) {
      return res.status(403).json({ 
        error: `Cannot block ${adminCount} admin user(s). Admins are protected.` 
      });
    }
    
    const alreadyBlockedCount = await User.countDocuments({ 
      _id: { $in: userIds }, 
      isBlocked: true 
    });
    
    const result = await User.updateMany(
      { _id: { $in: userIds }, isAdmin: false, isBlocked: false },
      {
        isBlocked: true,
        blockedReason: reason || 'Bulk blocked by admin',
        blockedAt: new Date()
      }
    );
    
    const blockedCount = result.modifiedCount;
    const skippedCount = alreadyBlockedCount;
    const failedCount = userIds.length - blockedCount - skippedCount;
    
    res.json({ 
      success: true,
      message: 'Bulk block completed',
      blocked: blockedCount,
      skipped: skippedCount,
      failed: failedCount,
      total: userIds.length,
      reason: reason || 'Bulk blocked by admin'
    });
  } catch (error) {
    console.error('Error bulk blocking users:', error);
    res.status(500).json({ error: 'Failed to bulk block users' });
  }
};

exports.bulkUnblockUsers = async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'Please select at least one user' });
    }
    
    if (userIds.length > 100) {
      return res.status(400).json({ 
        error: `Cannot bulk unblock more than 100 users at once (${userIds.length} selected)` 
      });
    }
    
    const invalidIds = userIds.filter(id => !isValidObjectId(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ 
        error: `Invalid user IDs provided: ${invalidIds.slice(0, 3).join(', ')}${invalidIds.length > 3 ? '...' : ''}` 
      });
    }
    
    const alreadyUnblockedCount = await User.countDocuments({ 
      _id: { $in: userIds }, 
      isBlocked: false 
    });
    
    const result = await User.updateMany(
      { _id: { $in: userIds }, isBlocked: true },
      {
        isBlocked: false,
        blockedReason: '',
        blockedAt: null
      }
    );
    
    const unblockedCount = result.modifiedCount;
    const skippedCount = alreadyUnblockedCount;
    const failedCount = userIds.length - unblockedCount - skippedCount;
    
    res.json({ 
      success: true,
      message: 'Bulk unblock completed',
      unblocked: unblockedCount,
      skipped: skippedCount,
      failed: failedCount,
      total: userIds.length
    });
  } catch (error) {
    console.error('Error bulk unblocking users:', error);
    res.status(500).json({ error: 'Failed to bulk unblock users' });
  }
};

exports.resetToxicCount = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { toxicMessageCount: 0 },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      message: 'Toxic count reset successfully',
      user 
    });
  } catch (error) {
    console.error('Error resetting toxic count:', error);
    res.status(500).json({ error: 'Failed to reset toxic count' });
  }
};
