require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./src/lib/db.js');
const Otp = require('./src/models/otp.model.js');
const User = require('./src/models/user.model.js');
const { sendOtpEmail, generateOtp } = require('./src/services/emailOtpService.js');

async function testFullOtpFlow() {
  console.log('=== Full OTP Flow Test ===');
  
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Database connected');
    
    const testEmail = 'test@example.com';
    
    // 1. Check if user exists
    const existingUser = await User.findOne({ email: testEmail });
    if (existingUser) {
      console.log('❌ Test email already exists in database');
      return;
    }
    console.log('✅ Test email not in database');
    
    // 2. Generate and save OTP
    const otp = generateOtp();
    console.log('Generated OTP:', otp);
    
    // Delete existing OTPs
    await Otp.deleteMany({ email: testEmail });
    console.log('✅ Cleared existing OTPs');
    
    // Save new OTP
    const otpRecord = await Otp.create({
      email: testEmail,
      otp: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });
    console.log('✅ OTP saved to database');
    
    // 3. Test email sending
    const emailResult = await sendOtpEmail(testEmail, otp);
    console.log('Email result:', emailResult);
    
    // 4. Verify OTP can be found
    const foundOtp = await Otp.findOne({ email: testEmail, otp: otp });
    if (foundOtp) {
      console.log('✅ OTP found in database');
      console.log('Expires at:', foundOtp.expiresAt);
    } else {
      console.log('❌ OTP not found in database');
    }
    
    // 5. Test with wrong OTP
    const wrongOtp = await Otp.findOne({ email: testEmail, otp: '999999' });
    if (!wrongOtp) {
      console.log('✅ Wrong OTP correctly rejected');
    }
    
    // Cleanup
    await Otp.deleteMany({ email: testEmail });
    console.log('✅ Cleanup completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

testFullOtpFlow();