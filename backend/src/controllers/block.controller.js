const Block = require('../models/block.model.js');
const User = require('../models/user.model.js');

const blockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const blockerId = req.user._id;

    if (blockerId.toString() === userId) {
      return res.status(400).json({ error: 'Cannot block yourself' });
    }

    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingBlock = await Block.findOne({ blockerId, blockedId: userId });
    if (existingBlock) {
      return res.status(409).json({ error: 'User already blocked' });
    }

    const block = new Block({ blockerId, blockedId: userId });
    await block.save();

    res.json({ success: true, message: 'User blocked successfully' });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const unblockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const blockerId = req.user._id;

    const block = await Block.findOneAndDelete({ blockerId, blockedId: userId });
    if (!block) {
      return res.status(404).json({ error: 'User not blocked' });
    }

    res.json({ success: true, message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getBlockStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const [iBlockedThem, theyBlockedMe] = await Promise.all([
      Block.findOne({ blockerId: currentUserId, blockedId: userId }),
      Block.findOne({ blockerId: userId, blockedId: currentUserId })
    ]);

    res.json({
      success: true,
      iBlockedThem: !!iBlockedThem,
      theyBlockedMe: !!theyBlockedMe,
      canCommunicate: !iBlockedThem && !theyBlockedMe
    });
  } catch (error) {
    console.error('Error getting block status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  blockUser,
  unblockUser,
  getBlockStatus
};