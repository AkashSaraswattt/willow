const express = require('express');
const { getSuggestion } = require('../controllers/moderation.controller.js');
const { protectRoute } = require('../middleware/auth.middleware.js');

const router = express.Router();

router.post('/suggest', protectRoute, getSuggestion);

module.exports = router;