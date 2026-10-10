const express = require('express');
const { checkAuth, login, logout, signup, updateProfile, sendOtp, verifyOtp, forgotPassword, resetPassword } = require('../controllers/auth.controller.js');
const { protectRoute } = require('../middleware/auth.middleware.js');
const { sendOtpEmail, generateOtp } = require('../services/brevoEmailService.js');

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Test route for email functionality
router.get("/test-email", async (req, res) => {
  const testEmail = process.env.EMAIL_USER; // Send to your own email for testing
  const testOtp = generateOtp();
  
  const result = await sendOtpEmail(testEmail, testOtp);
  res.json(result);
});

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

module.exports = router;