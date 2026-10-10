require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { connectDB } = require('../lib/db');

async function seedAdmin() {
  try {
    await connectDB();
    
    const existingAdmin = await User.findOne({ email: 'admin@willow.in' });
    
    if (existingAdmin) {
      // Update existing admin password
      const hashedPassword = await bcrypt.hash('Willow@17', 10);
      await User.findByIdAndUpdate(existingAdmin._id, {
        password: hashedPassword,
        isAdmin: true
      });
      console.log('✅ Admin password updated successfully');
      console.log('Email: admin@willow.in');
      console.log('Password: Willow@17');
      process.exit(0);
    }
    
    const hashedPassword = await bcrypt.hash('Willow@17', 10);
    
    await User.create({
      email: 'admin@willow.in',
      fullName: 'Admin',
      password: hashedPassword,
      isAdmin: true,
      profilePic: ''
    });
    
    console.log('✅ Admin user created successfully');
    console.log('Email: admin@willow.in');
    console.log('Password: Willow@17');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
