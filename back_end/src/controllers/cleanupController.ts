import { Request, Response } from 'express';
import { DonorModel } from '../models/Donor';
import mongoose from 'mongoose';

/**
 * Admin-only endpoint to cleanup invalid donors
 * Deletes ALL donors without a valid userId reference
 */
export async function cleanupInvalidDonors(req: Request, res: Response) {
  try {
    console.log('🔍 Starting cleanup of invalid donors...');
    
    // Get ALL donors without any filters
    const allDonors = await DonorModel.find({}).lean();
    console.log(`📊 Total donors in database: ${allDonors.length}`);
    
    // Get the User model to check if userId exists
    const UserModel = mongoose.model('User');
    
    const invalidDonorIds: any[] = [];
    const invalidDonorDetails: any[] = [];
    
    // Check each donor
    for (const donor of allDonors) {
      let isInvalid = false;
      
      // Check if userId is missing or null
      if (!donor.userId) {
        isInvalid = true;
        console.log(`❌ Donor ${donor._id}: No userId field`);
      } else {
        // Check if the user actually exists
        const userExists = await UserModel.findById(donor.userId);
        if (!userExists) {
          isInvalid = true;
          console.log(`❌ Donor ${donor._id}: userId points to non-existent user ${donor.userId}`);
        }
      }
      
      if (isInvalid) {
        invalidDonorIds.push(donor._id);
        invalidDonorDetails.push({
          _id: donor._id,
          bloodGroup: donor.bloodGroup,
          name: donor.name || 'N/A',
          email: donor.email || 'N/A',
          userId: donor.userId || 'null'
        });
      }
    }

    console.log(`🗑️  Found ${invalidDonorIds.length} invalid donors to delete`);

    if (invalidDonorIds.length === 0) {
      return res.json({
        message: 'No invalid donors found. Database is clean!',
        deleted: 0,
        allDonorsCount: allDonors.length,
        validDonors: allDonors.length
      });
    }

    // Delete all invalid donors
    const result = await DonorModel.deleteMany({
      _id: { $in: invalidDonorIds }
    });

    console.log(`✅ Successfully deleted ${result.deletedCount} invalid donors`);

    return res.json({
      message: `Successfully deleted ${result.deletedCount} invalid donors!`,
      deleted: result.deletedCount,
      invalidDonors: invalidDonorDetails,
      beforeCount: allDonors.length,
      afterCount: allDonors.length - result.deletedCount
    });

  } catch (error) {
    console.error('❌ Cleanup error:', error);
    return res.status(500).json({ error: 'Failed to cleanup donors', details: error });
  }
}
