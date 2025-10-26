// Database Migration Script - Export local data to MongoDB Atlas
// Run this ONCE after setting up MongoDB Atlas

require('dotenv').config();

const mongoose = require('mongoose');

// Your LOCAL MongoDB URI
const LOCAL_URI = 'mongodb://localhost:27017/blood-bank';

// Your ATLAS MongoDB URI (from .env)
const ATLAS_URI = process.env.MONGODB_URI;

async function migrateData() {
  try {
    console.log('🔄 Starting data migration...\n');

    // Connect to LOCAL database
    console.log('📥 Connecting to local database...');
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Connected to local database\n');

    // Connect to ATLAS database
    console.log('📤 Connecting to Atlas database...');
    const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('✅ Connected to Atlas database\n');

    // Get all collections from local database
    const collections = await localConn.db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections to migrate:\n`);

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`  → Migrating collection: ${collectionName}`);

      // Get all documents from local collection
      const localCollection = localConn.db.collection(collectionName);
      const documents = await localCollection.find({}).toArray();

      if (documents.length === 0) {
        console.log(`    ℹ️  Empty collection, skipping...`);
        continue;
      }

      // Insert into Atlas collection
      const atlasCollection = atlasConn.db.collection(collectionName);
      
      // Drop existing data in Atlas collection (optional - remove if you want to keep existing data)
      await atlasCollection.deleteMany({});
      
      // Insert all documents
      await atlasCollection.insertMany(documents);
      console.log(`    ✅ Migrated ${documents.length} documents\n`);
    }

    console.log('🎉 Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Verify data in MongoDB Atlas dashboard');
    console.log('2. Update your local .env MONGODB_URI to use Atlas');
    console.log('3. Restart your local server');
    console.log('4. Redeploy to Render with Atlas URI in environment variables\n');

    // Close connections
    await localConn.close();
    await atlasConn.close();

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Check if ATLAS_URI is set
if (!ATLAS_URI) {
  console.error('❌ Error: MONGODB_URI not found in .env file');
  console.error('Please add your MongoDB Atlas URI to .env file first');
  process.exit(1);
}

// Run migration
migrateData();
