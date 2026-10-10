const express = require('express');
const { 
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
} = require('../controllers/group.controller.js');
const { protectRoute } = require('../middleware/auth.middleware.js');

const router = express.Router();

router.get('/', protectRoute, getUserGroups);
router.post('/', protectRoute, createGroup);
router.post('/join', protectRoute, joinGroup);
router.get('/me', protectRoute, getUserGroups);
router.get('/:groupId/messages', protectRoute, getGroupMessages);
router.get('/:groupId/members', protectRoute, getGroupMembers);
router.post('/:groupId/messages', protectRoute, sendGroupMessage);
router.delete('/:groupId/messages/:messageId', protectRoute, deleteGroupMessage);
router.get('/:groupId/qr', protectRoute, getGroupQR);
router.post('/:groupId/leave', protectRoute, leaveGroup);
router.post('/:groupId/remove', protectRoute, removeMember);

module.exports = router;