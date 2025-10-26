// Check what data exists in MongoDB Atlas
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

async function checkDatabase() {
  try {
    console.log('🔍 Connecting to MongoDB Atlas...\n');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected successfully!\n');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections:\n`);

    for (const collection of collections) {
      const collectionName = collection.name;
      const count = await mongoose.connection.db.collection(collectionName).countDocuments();
      console.log(`  📁 ${collectionName}: ${count} documents`);
    }

    console.log('\n🔍 Checking for admin users...');
    const adminCount = await mongoose.connection.db.collection('users').countDocuments({ role: 'admin' });
    console.log(`  👤 Admin users found: ${adminCount}`);

    if (adminCount === 0) {
      console.log('\n❌ NO ADMIN USERS FOUND - This is why login is failing!');
      console.log('\n💡 Solutions:');
      console.log('   1. Run migration script if you have local data');
      console.log('   2. Create a new admin user via setup endpoint');
    } else {
      console.log('\n✅ Admin users exist - checking credentials...');
      const admins = await mongoose.connection.db.collection('users').find({ role: 'admin' }).toArray();
      admins.forEach(admin => {
        console.log(`   - Email: ${admin.email}, Name: ${admin.name}`);
      });
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env file');
  process.exit(1);
}

checkDatabase();
