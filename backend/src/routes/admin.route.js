const express = require('express');
const { protectRoute } = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

const isAdmin = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

router.get('/stats', protectRoute, isAdmin, adminController.getDashboardStats);
router.get('/users', protectRoute, isAdmin, adminController.getAllUsers);
router.get('/users/:userId', protectRoute, isAdmin, adminController.getUserDetails);
router.post('/users/:userId/block', protectRoute, isAdmin, adminController.blockUser);
router.post('/users/:userId/unblock', protectRoute, isAdmin, adminController.unblockUser);
router.post('/users/:userId/reset-toxic', protectRoute, isAdmin, adminController.resetToxicCount);
router.post('/users/bulk-block', protectRoute, isAdmin, adminController.bulkBlockUsers);
router.post('/users/bulk-unblock', protectRoute, isAdmin, adminController.bulkUnblockUsers);
router.get('/moderation-logs', protectRoute, isAdmin, adminController.getModerationLogs);
router.get('/export', protectRoute, isAdmin, adminController.exportReport);
router.post('/sync-toxic-counts', protectRoute, isAdmin, adminController.syncToxicCounts);

module.exports = router;
