require('dotenv').config();
const mongoose = require('mongoose');

// Define User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'hospital', 'donor', 'external'], required: true },
  name: { type: String, required: true },
  phone: { type: String },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

// Define Donor Schema
const DonorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodGroup: { type: String, required: true },
  dob: { type: Date },
  lastDonationDate: { type: Date },
  donationHistory: [{ date: Date, units: Number }],
  eligibilityNotes: { type: String },
}, { timestamps: true });

const Donor = mongoose.model('Donor', DonorSchema);

async function cleanupDuplicates() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected!\n');

    console.log('🔍 Finding all donors...');
    const allDonors = await Donor.find().populate('userId', 'name email').lean();
    console.log(`📊 Total donors found: ${allDonors.length}\n`);

    if (allDonors.length === 0) {
      console.log('ℹ️  No donors found in database.');
      await mongoose.connection.close();
      return;
    }

    // Group by userId
    const donorsByUserId = new Map();
    
    allDonors.forEach(donor => {
      const userId = donor.userId?._id?.toString();
      if (userId) {
        if (!donorsByUserId.has(userId)) {
          donorsByUserId.set(userId, []);
        }
        donorsByUserId.get(userId).push(donor);
      }
    });

    console.log(`👥 Unique users with donor profiles: ${donorsByUserId.size}\n`);

    // Find and remove duplicates
    let duplicatesRemoved = 0;
    let duplicateGroups = 0;

    for (const [userId, donors] of donorsByUserId.entries()) {
      if (donors.length > 1) {
        duplicateGroups++;
        console.log(`⚠️  Found ${donors.length} duplicates for: ${donors[0].userId?.name || 'Unknown'} (${donors[0].userId?.email || 'No email'})`);
        
        // Sort by creation date (keep oldest)
        donors.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const keepDonor = donors[0];
        const duplicates = donors.slice(1);

        console.log(`   ✓ Keeping: ${keepDonor._id} (created: ${new Date(keepDonor.createdAt).toLocaleString()})`);

        // Delete duplicates
        for (const duplicate of duplicates) {
          console.log(`   ✗ Deleting: ${duplicate._id} (created: ${new Date(duplicate.createdAt).toLocaleString()})`);
          await Donor.findByIdAndDelete(duplicate._id);
          duplicatesRemoved++;
        }
        console.log('');
      }
    }

    if (duplicatesRemoved === 0) {
      console.log('✨ No duplicates found! Database is clean.\n');
    } else {
      console.log('═══════════════════════════════════════');
      console.log('✅ CLEANUP COMPLETE!');
      console.log('═══════════════════════════════════════');
      console.log(`   Duplicate groups found: ${duplicateGroups}`);
      console.log(`   Total duplicates removed: ${duplicatesRemoved}`);
      console.log(`   Remaining donors: ${allDonors.length - duplicatesRemoved}`);
      console.log('═══════════════════════════════════════\n');
    }

    // Verify final count
    const finalCount = await Donor.countDocuments();
    console.log(`📊 Final database count: ${finalCount} donors\n`);

    await mongoose.connection.close();
    console.log('👋 Database connection closed.');
    console.log('✅ Done!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run cleanup
cleanupDuplicates();
