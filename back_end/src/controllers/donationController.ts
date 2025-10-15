import { Request, Response } from 'express';
import { DonationModel } from '../models/Donation';
import { DonorModel } from '../models/Donor';
import { InventoryModel } from '../models/Inventory';

/**
 * Record a new blood donation
 * Admin only - records when blood is physically collected from a donor
 */
export async function recordDonation(req: Request, res: Response) {
  try {
    const { donorId, collectionDate, units, notes, verifiedBy, location } = req.body;
    const adminUserId = req.user?.sub;

    // Validate required fields
    if (!donorId) {
      return res.status(400).json({ error: 'Donor ID is required' });
    }

    // Find donor
    const donor = await DonorModel.findById(donorId);
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    // Check if donor is active
    if (!donor.isActive) {
      return res.status(400).json({ 
        error: 'Donor is inactive',
        message: 'This donor has been deactivated. Please contact administrator.'
      });
    }

    // Warning if donor not eligible (but allow admin to override)
    const isEligible = donor.isDonorEligible();
    const daysUntilEligible = donor.getDaysUntilEligible();
    
    if (!isEligible) {
      console.warn(`Warning: Donor ${donorId} not eligible yet (${daysUntilEligible} days remaining)`);
      // Don't block, but log warning
    }

    // Create donation record
    const donation = await DonationModel.create({
      donorId: donor._id,
      collectionDate: collectionDate || new Date(),
      units: units || 1,
      bloodGroup: donor.bloodGroup,
      recordedBy: adminUserId,
      verifiedBy,
      notes,
      status: 'collected'
    });

    // Update donor's donation history
    donor.lastDonationDate = donation.collectionDate;
    donor.donationHistory.push({
      date: donation.collectionDate,
      units: donation.units
    });
    // Auto-set availability to false (donor cannot be available when not eligible)
    donor.isAvailable = false;
    // nextEligibleDate will be auto-calculated by pre-save hook
    await donor.save();

    // Update inventory
    const expiryDate = new Date(donation.collectionDate);
    expiryDate.setDate(expiryDate.getDate() + 35); // Blood expires in 35 days

    await InventoryModel.create({
      bloodGroup: donor.bloodGroup,
      units: donation.units,
      expiryDate,
      location: location || 'Not specified',
      donorId: donor._id,
      collectionDate: donation.collectionDate
    });

    // Populate donor info for response
    const populatedDonation = await DonationModel.findById(donation._id)
      .populate('donorId', 'userId bloodGroup')
      .populate('recordedBy', 'name email');

    return res.status(201).json({
      message: 'Donation recorded successfully',
      donation: populatedDonation,
      donor: {
        _id: donor._id,
        lastDonationDate: donor.lastDonationDate,
        nextEligibleDate: donor.nextEligibleDate,
        totalDonations: donor.donationHistory.length
      },
      warning: !isEligible ? `Donor was not eligible (${daysUntilEligible} days remaining)` : null
    });

  } catch (error) {
    console.error('Record donation error:', error);
    return res.status(500).json({ error: 'Failed to record donation' });
  }
}

/**
 * Get all donations with filters
 * Admin only
 */
export async function listDonations(req: Request, res: Response) {
  try {
    const { status, bloodGroup, startDate, endDate, donorId } = req.query;

    // Build filter
    const filter: any = {};
    
    if (status) filter.status = status;
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (donorId) filter.donorId = donorId;
    
    if (startDate || endDate) {
      filter.collectionDate = {};
      if (startDate) filter.collectionDate.$gte = new Date(startDate as string);
      if (endDate) filter.collectionDate.$lte = new Date(endDate as string);
    }

    const donations = await DonationModel.find(filter)
      .populate('donorId', 'userId bloodGroup')
      .populate('recordedBy', 'name email')
      .sort({ collectionDate: -1 })
      .limit(100);

    return res.json({
      count: donations.length,
      donations
    });

  } catch (error) {
    console.error('List donations error:', error);
    return res.status(500).json({ error: 'Failed to fetch donations' });
  }
}

/**
 * Get donation statistics
 * Admin only
 */
export async function getDonationStats(req: Request, res: Response) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalDonations, recentDonations, donationsByBloodGroup] = await Promise.all([
      // Total donations (collected)
      DonationModel.countDocuments({ status: 'collected' }),
      
      // Recent donations (last 30 days)
      DonationModel.countDocuments({ 
        status: 'collected',
        collectionDate: { $gte: thirtyDaysAgo }
      }),
      
      // Donations by blood group
      DonationModel.aggregate([
        { $match: { status: 'collected' } },
        { $group: { 
          _id: '$bloodGroup', 
          count: { $sum: 1 },
          totalUnits: { $sum: '$units' }
        }},
        { $sort: { count: -1 } }
      ])
    ]);

    return res.json({
      totalDonations,
      recentDonations,
      donationsByBloodGroup
    });

  } catch (error) {
    console.error('Donation stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch donation statistics' });
  }
}

/**
 * Get donor's donation history
 * Donor can view their own, admin can view any
 */
export async function getDonorHistory(req: Request, res: Response) {
  try {
    const { donorId } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.sub;

    // Find donor
    const donor = await DonorModel.findById(donorId).populate('userId');
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    // Authorization check: donor can only view their own history
    if (userRole === 'donor' && donor.userId?.toString() !== userId) {
      return res.status(403).json({ error: 'You can only view your own donation history' });
    }

    // Get donations
    const donations = await DonationModel.find({ 
      donorId: donor._id,
      status: 'collected'
    })
      .sort({ collectionDate: -1 })
      .select('collectionDate units bloodGroup notes createdAt');

    return res.json({
      donor: {
        _id: donor._id,
        bloodGroup: donor.bloodGroup,
        totalDonations: donations.length,
        lastDonationDate: donor.lastDonationDate,
        nextEligibleDate: donor.nextEligibleDate,
        isEligible: donor.isDonorEligible(),
        daysUntilEligible: donor.getDaysUntilEligible()
      },
      donations
    });

  } catch (error) {
    console.error('Get donor history error:', error);
    return res.status(500).json({ error: 'Failed to fetch donation history' });
  }
}
