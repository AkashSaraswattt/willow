const { generateToken } = require('../lib/utils.js');
const User = require('../models/user.model.js');
const Otp = require('../models/otp.model.js');
const bcrypt = require('bcryptjs');
const cloudinary = require('../lib/cloudinary.js');
const { sendOtpEmail, generateOtp } = require('../services/brevoEmailService.js');

const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
        createdAt: newUser.createdAt,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ 
        message: "Account blocked",
        reason: user.blockedReason || "Your account has been blocked. Please contact support."
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const sendOtp = async (req, res) => {
  const { email } = req.body;
  console.log(`OTP request received for ${email}`);
  
  try {
    if (!email) {
      console.log('No email provided');
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`Email already exists: ${email}`);
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const otp = generateOtp();
    console.log(`Generated OTP for ${email}`);
    
    // Delete any existing OTP for this email
    await Otp.deleteMany({ email });
    
    // Save new OTP with expiresAt field
    await Otp.create({ 
      email, 
      otp,
      type: 'signup',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
    });
    
    console.log(`OTP saved to database for ${email}`);
    
    // Send email with proper error handling
    try {
      const emailResult = await sendOtpEmail(email, otp);
      console.log(`OTP email sent successfully to ${email}`);
      res.status(200).json({ success: true, messageId: emailResult.messageId });
    } catch (emailError) {
      console.error(`Email sending failed: ${emailError.message}`);
      // Return error since email is critical for OTP flow
      res.status(500).json({ 
        success: false, 
        error: "Email delivery failed",
        message: "Unable to send OTP email. Please try again." 
      });
    }
    
  } catch (error) {
    console.error(`Error in sendOtp controller: ${error.message}`);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp, fullName, password } = req.body;
  try {
    if (!email || !otp || !fullName || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Verify OTP
    const otpRecord = await Otp.findOne({ email, otp, type: 'signup' });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    
    // Delete OTP after successful verification
    await Otp.deleteOne({ email, otp, type: 'signup' });

    generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      createdAt: newUser.createdAt,
    });
  } catch (error) {
    console.log("Error in verifyOtp controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOtp();
    
    // Delete any existing OTP for this email
    await Otp.deleteMany({ email });
    
    // Save new OTP for password reset
    await Otp.create({ 
      email, 
      otp,
      type: 'password_reset',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    });
    
    // Send password reset email
    const emailResult = await sendOtpEmail(email, otp, 'password_reset');
    res.status(200).json({ success: true, message: "Password reset OTP sent to your email" });
    
  } catch (error) {
    console.error(`Error in forgotPassword controller: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Verify OTP
    const otpRecord = await Otp.findOne({ email, otp, type: 'password_reset' });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Find user and update password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.password = hashedPassword;
    await user.save();
    
    // Delete OTP after successful reset
    await Otp.deleteOne({ email, otp, type: 'password_reset' });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(`Error in resetPassword controller: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { signup, login, logout, updateProfile, checkAuth, sendOtp, verifyOtp, forgotPassword, resetPassword };