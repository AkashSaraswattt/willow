require('dotenv').config();
const User = require('./src/models/user.model');
const { connectDB } = require('./src/lib/db');

async function testReset() {
  try {
    await connectDB();
    
    // Find a user with toxic count > 0
    const user = await User.findOne({ toxicMessageCount: { $gt: 0 } });
    
    if (!user) {
      console.log('No users with toxic count found');
      process.exit(0);
    }
    
    console.log(`Before: ${user.email} - toxicMessageCount: ${user.toxicMessageCount}`);
    
    // Reset
    const updated = await User.findByIdAndUpdate(
      user._id,
      { toxicMessageCount: 0 },
      { new: true }
    );
    
    console.log(`After: ${updated.email} - toxicMessageCount: ${updated.toxicMessageCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testReset();
