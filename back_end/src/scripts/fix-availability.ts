import 'dotenv/config';
import { connectToDatabase } from '../config/db';
import { DonorModel } from '../models/Donor';

/**
 * Fix existing donors: Set isAvailable = false for donors who are not eligible
 * Run this once after implementing strict mode
 */
async function fixDonorAvailability() {
  try {
    await connectToDatabase();
    console.log('Connected to database');

    // Get all donors
    const donors = await DonorModel.find();
    console.log(`Found ${donors.length} donors`);

    let updatedCount = 0;

    for (const donor of donors) {
      const isEligible = donor.isDonorEligible();
      
      // If donor is not eligible but marked as available, fix it
      if (!isEligible && donor.isAvailable) {
        donor.isAvailable = false;
        await donor.save();
        updatedCount++;
        
        console.log(`✓ Fixed donor ${donor._id}: Set isAvailable = false (not eligible for ${donor.getDaysUntilEligible()} more days)`);
      }
    }

    console.log(`\n✅ Done! Updated ${updatedCount} donor(s)`);
    process.exit(0);

  } catch (error) {
    console.error('Error fixing donor availability:', error);
    process.exit(1);
  }
}

fixDonorAvailability();
