const express = require('express');
const { protectRoute } = require('../middleware/auth.middleware.js');
const { blockUser, unblockUser, getBlockStatus } = require('../controllers/block.controller.js');

const router = express.Router();

router.post('/block', protectRoute, blockUser);
router.post('/unblock', protectRoute, unblockUser);
router.get('/status/:userId', protectRoute, getBlockStatus);

module.exports = router;