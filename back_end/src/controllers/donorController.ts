import { Request, Response } from 'express';
import { DonorModel } from '../models/Donor';

export async function registerDonor(req: Request, res: Response) {
  try {
    const { bloodGroup, dob, eligibilityNotes } = req.body;
    const userId = req.user?.sub; // Get from authenticated user
    
    if (!userId || !bloodGroup) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if donor already exists
    const existing = await DonorModel.findOne({ userId });
    if (existing) {
      return res.status(409).json({ error: 'Donor profile already exists' });
    }
    
    const donor = await DonorModel.create({ userId, bloodGroup, dob, eligibilityNotes });
    return res.status(201).json(donor);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to register donor' });
  }
}

export async function donorProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const donor = await DonorModel.findOne({ userId }).populate('userId', 'name email');
    if (!donor) {
      return res.status(404).json({ error: 'Donor profile not found' });
    }
    
    return res.json(donor);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch donor profile' });
  }
}

export async function listAllDonors(req: Request, res: Response) {
  try {
    const donors = await DonorModel.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    
    // Add calculated fields for each donor
    const enrichedDonors = donors.map(donor => ({
      ...donor.toObject(),
      isEligible: donor.isDonorEligible(),
      daysUntilEligible: donor.getDaysUntilEligible(),
      canDonate: donor.canDonate()
    }));
    
    return res.json(enrichedDonors);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch donors' });
  }
}

/**
 * Toggle donor availability
 * Donor can mark themselves as available/unavailable
 */
export async function toggleAvailability(req: Request, res: Response) {
  try {
    const userId = req.user?.sub;
    const { isAvailable } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ error: 'isAvailable must be a boolean' });
    }

    const donor = await DonorModel.findOne({ userId });
    if (!donor) {
      return res.status(404).json({ error: 'Donor profile not found' });
    }

    // Update availability
    donor.isAvailable = isAvailable;
    await donor.save();

    return res.json({
      message: `Donor marked as ${isAvailable ? 'available' : 'unavailable'}`,
      donor: {
        _id: donor._id,
        isAvailable: donor.isAvailable,
        isEligible: donor.isDonorEligible(),
        canDonate: donor.canDonate()
      }
    });

  } catch (error) {
    console.error('Toggle availability error:', error);
    return res.status(500).json({ error: 'Failed to update availability' });
  }
}

/**
 * Toggle donor active status
 * Admin only - for administrative control
 */
export async function toggleDonorStatus(req: Request, res: Response) {
  try {
    const { donorId } = req.params;
    const { isActive, reason } = req.body;

    if (!donorId) {
      return res.status(400).json({ error: 'Donor ID is required' });
    }

    const donor = await DonorModel.findById(donorId);
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    // Update status
    donor.isActive = isActive !== undefined ? isActive : !donor.isActive;
    
    if (reason) {
      donor.eligibilityNotes = reason;
    }
    
    await donor.save();

    return res.json({
      message: `Donor ${donor.isActive ? 'activated' : 'deactivated'}`,
      donor: {
        _id: donor._id,
        isActive: donor.isActive,
        isAvailable: donor.isAvailable,
        canDonate: donor.canDonate(),
        reason: donor.eligibilityNotes
      }
    });

  } catch (error) {
    console.error('Toggle donor status error:', error);
    return res.status(500).json({ error: 'Failed to update donor status' });
  }
}

/**
 * Get donor eligibility status
 * Returns detailed eligibility information
 */
export async function getDonorEligibility(req: Request, res: Response) {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const donor = await DonorModel.findOne({ userId });
    if (!donor) {
      return res.status(404).json({ error: 'Donor profile not found' });
    }

    return res.json({
      isActive: donor.isActive,
      isAvailable: donor.isAvailable,
      isEligible: donor.isDonorEligible(),
      canDonate: donor.canDonate(),
      lastDonationDate: donor.lastDonationDate,
      nextEligibleDate: donor.nextEligibleDate,
      daysUntilEligible: donor.getDaysUntilEligible(),
      totalDonations: donor.donationHistory.length,
      eligibilityNotes: donor.eligibilityNotes
    });

  } catch (error) {
    console.error('Get eligibility error:', error);
    return res.status(500).json({ error: 'Failed to fetch eligibility status' });
  }
}


