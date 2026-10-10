require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../lib/db');

async function fixModerationLog() {
  try {
    await connectDB();
    
    // Drop the old collection
    await mongoose.connection.db.dropCollection('moderationlogs').catch(() => {
      console.log('Collection does not exist, will create new one');
    });
    
    console.log('✅ Old ModerationLog collection dropped');
    console.log('✅ New schema will be created automatically on first use');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixModerationLog();
