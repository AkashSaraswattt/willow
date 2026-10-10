const express = require('express');
const { protectRoute } = require('../middleware/auth.middleware.js');
const {
  sendFriendRequest,
  cancelFriendRequest,
  respondToFriendRequest,
  getSentRequests,
  getReceivedRequests,
  getFriendsList,
  searchUsers
} = require('../controllers/friend.controller.js');

const router = express.Router();

router.post('/request', protectRoute, sendFriendRequest);
router.post('/request/cancel', protectRoute, cancelFriendRequest);
router.post('/request/respond', protectRoute, respondToFriendRequest);
router.get('/sent', protectRoute, getSentRequests);
router.get('/received', protectRoute, getReceivedRequests);
router.get('/list', protectRoute, getFriendsList);
router.get('/search', protectRoute, searchUsers);

module.exports = router;