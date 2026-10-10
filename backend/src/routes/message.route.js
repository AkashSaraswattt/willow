const express = require('express');
const { protectRoute } = require('../middleware/auth.middleware.js');
const { getMessages, getUsersForSidebar, sendMessage, deleteMessage } = require('../controllers/message.controller.js');

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.post("/send/:id", protectRoute, sendMessage);
router.delete("/delete/:messageId", protectRoute, deleteMessage);
router.get("/:id", protectRoute, getMessages);

console.log('Message routes loaded with DELETE /delete/:messageId');

module.exports = router;