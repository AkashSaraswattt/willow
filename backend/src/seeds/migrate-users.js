require('dotenv').config();
const User = require('../models/user.model');
const { connectDB } = require('../lib/db');

async function migrateUsers() {
  try {
    await connectDB();
    
    const result = await User.updateMany(
      { 
        $or: [
          { isBlocked: { $exists: false } },
          { isAdmin: { $exists: false } },
          { toxicMessageCount: { $exists: false } }
        ]
      },
      {
        $set: {
          isBlocked: false,
          blockedReason: '',
          isAdmin: false,
          toxicMessageCount: 0
        }
      }
    );
    
    console.log(`✅ Migration completed: ${result.modifiedCount} users updated`);
    process.exit(0);
  } catch (error) {
    console.error('Error migrating users:', error);
    process.exit(1);
  }
}

migrateUsers();
