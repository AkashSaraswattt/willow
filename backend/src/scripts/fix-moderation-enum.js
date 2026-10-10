const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function fixModerationEnum() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop the existing collection to force schema update
    const db = mongoose.connection.db;
    
    try {
      await db.collection('moderationlogs').drop();
      console.log('Dropped moderationlogs collection');
    } catch (error) {
      console.log('Collection may not exist, continuing...');
    }

    console.log('Schema will be recreated on next use');
    
    await mongoose.disconnect();
    console.log('Migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

fixModerationEnum();