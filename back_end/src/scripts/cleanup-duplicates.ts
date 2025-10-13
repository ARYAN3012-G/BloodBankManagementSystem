import 'dotenv/config';
import { connectToDatabase } from '../config/db';
import { DonorModel } from '../models/Donor';
import mongoose from 'mongoose';

async function cleanupDuplicateDonors() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    
    console.log('Finding duplicate donors...');
    
    // Get all donors
    const allDonors = await DonorModel.find().populate('userId', 'name email');
    
    console.log(`Total donors found: ${allDonors.length}`);
    
    // Group by userId
    const donorsByUserId = new Map<string, any[]>();
    
    allDonors.forEach(donor => {
      const userId = donor.userId?._id?.toString() || donor.userId?.toString();
      if (userId) {
        if (!donorsByUserId.has(userId)) {
          donorsByUserId.set(userId, []);
        }
        donorsByUserId.get(userId)!.push(donor);
      }
    });
    
    console.log(`Unique users with donor profiles: ${donorsByUserId.size}`);
    
    // Find and remove duplicates
    let duplicatesRemoved = 0;
    
    for (const [userId, donors] of donorsByUserId.entries()) {
      if (donors.length > 1) {
        console.log(`\nFound ${donors.length} duplicate entries for user: ${donors[0].userId?.name || userId}`);
        
        // Keep the oldest one (first created)
        donors.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        const keepDonor = donors[0];
        const duplicates = donors.slice(1);
        
        console.log(`  Keeping donor ID: ${keepDonor._id} (created: ${keepDonor.createdAt})`);
        
        // Delete duplicates
        for (const duplicate of duplicates) {
          console.log(`  Deleting duplicate ID: ${duplicate._id} (created: ${duplicate.createdAt})`);
          await DonorModel.findByIdAndDelete(duplicate._id);
          duplicatesRemoved++;
        }
      }
    }
    
    console.log(`\n✅ Cleanup complete!`);
    console.log(`   Total duplicates removed: ${duplicatesRemoved}`);
    console.log(`   Remaining donors: ${allDonors.length - duplicatesRemoved}`);
    
    // Verify cleanup
    const remainingDonors = await DonorModel.find();
    console.log(`\n📊 Final count: ${remainingDonors.length} donors`);
    
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupDuplicateDonors();
