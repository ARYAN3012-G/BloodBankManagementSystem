import { Request, Response } from 'express';
import { DonorModel, DonorDocument, BloodGroup } from '../models/Donor';

// Create a new donor (admin or self-registration)
export async function createDonor(req: Request, res: Response) {
  try {
    const {
      name,
      email,
      phone,
      dateOfBirth,
      bloodGroup,
      address,
      emergencyContact,
      donorType,
      availability,
      notificationPreferences,
      weight,
      height,
      medicalConditions,
      medications
    } = req.body;

    // Check if donor already exists
    const existingDonor = await DonorModel.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingDonor) {
      return res.status(400).json({
        error: 'Donor with this email or phone already exists'
      });
    }

    const donor = new DonorModel({
      name,
      email,
      phone,
      dateOfBirth: new Date(dateOfBirth),
      bloodGroup,
      address,
      emergencyContact,
      donorType: donorType || 'regular',
      availability: availability || {
        weekdays: true,
        weekends: false,
        evenings: true,
        mornings: false
      },
      notificationPreferences: notificationPreferences || {
        email: true,
        sms: true,
        phone: false
      },
      weight,
      height,
      medicalConditions,
      medications,
      registeredBy: req.user?.sub,
      registrationDate: new Date()
    });

    await donor.save();

    return res.status(201).json({
      message: 'Donor registered successfully',
      donor: {
        id: donor._id,
        name: donor.name,
        email: donor.email,
        bloodGroup: donor.bloodGroup,
        donorType: donor.donorType,
        verificationStatus: donor.verificationStatus
      }
    });
  } catch (error) {
    console.error('Create donor error:', error);
    return res.status(500).json({ error: 'Failed to create donor' });
  }
}

// Register donor (for authenticated users)
export async function registerDonor(req: Request, res: Response) {
  try {
    const {
      bloodGroup,
      dob,
      eligibilityNotes,
      // Enhanced registration fields
      name,
      email,
      phone,
      address,
      emergencyContact,
      donorType,
      availability,
      notificationPreferences,
      weight,
      height,
      maxDistanceKm
    } = req.body;
    
    const userId = req.user?.sub; // Get from authenticated user

    if (!userId || !bloodGroup) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if donor already exists
    const existing = await DonorModel.findOne({ userId });
    if (existing) {
      return res.status(409).json({ error: 'Donor profile already exists' });
    }

    // Check if email/phone already exists
    if (email || phone) {
      const existingContact = await DonorModel.findOne({
        $or: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : [])
        ]
      });
      
      if (existingContact) {
        return res.status(400).json({
          error: 'Donor with this email or phone already exists'
        });
      }
    }

    const donor = await DonorModel.create({
      userId,
      bloodGroup,
      dateOfBirth: dob ? new Date(dob) : undefined,
      eligibilityNotes,
      // Enhanced fields
      name: name || req.user?.name || 'Unknown',
      email: email || req.user?.email || '',
      phone: phone || req.user?.phone || '',
      address,
      emergencyContact,
      donorType: donorType || 'regular',
      status: 'active',
      availability: availability || {
        weekdays: true,
        weekends: false,
        evenings: true,
        mornings: false
      },
      notificationPreferences: notificationPreferences || {
        email: true,
        sms: true,
        phone: false
      },
      weight,
      height,
      maxDistanceKm: maxDistanceKm || 10,
      // Legacy compatibility
      isAvailable: true,
      isActive: true,
      verificationStatus: 'pending'
    });

    return res.status(201).json({
      message: 'Donor registered successfully',
      donor: {
        id: donor._id,
        name: donor.name,
        email: donor.email,
        bloodGroup: donor.bloodGroup,
        donorType: donor.donorType,
        status: donor.status,
        verificationStatus: donor.verificationStatus
      }
    });
  } catch (error) {
    console.error('Register donor error:', error);
    return res.status(500).json({ error: 'Failed to register donor' });
  }
}

// Get donor profile (for authenticated users)
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

// Get all donors (admin only)
export async function getAllDonors(req: Request, res: Response) {
  try {
    const {
      bloodGroup,
      status,
      donorType,
      page = 1,
      limit = 10,
      search
    } = req.query;

    let query: any = {};

    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (status) query.status = status;
    if (donorType) query.donorType = donorType;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const donors = await DonorModel.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .populate('registeredBy', 'name email');

    const total = await DonorModel.countDocuments(query);

    return res.json({
      donors,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalDonors: total,
        hasNext: Number(page) * Number(limit) < total,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Get donors error:', error);
    return res.status(500).json({ error: 'Failed to fetch donors' });
  }
}

// List all donors (admin view)
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

// Get donor by ID
export async function getDonorById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const donor = await DonorModel.findById(id)
      .populate('registeredBy', 'name email');

    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    return res.json(donor);
  } catch (error) {
    console.error('Get donor error:', error);
    return res.status(500).json({ error: 'Failed to fetch donor' });
  }
}

// Update donor information
export async function updateDonor(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const donor = await DonorModel.findById(id);
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    // Update allowed fields
    const allowedUpdates = [
      'name', 'phone', 'address', 'emergencyContact',
      'donorType', 'availability', 'notificationPreferences',
      'weight', 'height', 'medicalConditions', 'medications',
      'notes'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        donor.set(field, updates[field]);
      }
    });

    await donor.save();

    return res.json({
      message: 'Donor updated successfully',
      donor
    });
  } catch (error) {
    console.error('Update donor error:', error);
    return res.status(500).json({ error: 'Failed to update donor' });
  }
}

// Update donor status (admin only)
export async function updateDonorStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, verificationStatus, notes } = req.body;

    const donor = await DonorModel.findById(id);
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    if (status) donor.status = status;
    if (verificationStatus) donor.verificationStatus = verificationStatus;
    if (notes !== undefined) donor.notes = notes;

    await donor.save();

    return res.json({
      message: 'Donor status updated successfully',
      donor
    });
  } catch (error) {
    console.error('Update donor status error:', error);
    return res.status(500).json({ error: 'Failed to update donor status' });
  }
}

// Toggle availability (donor self-control)
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

// Toggle donor status (admin control)
export async function toggleDonorStatus(req: Request, res: Response) {
  try {
    const { donorId } = req.params;
    const { isActive, reason } = req.body;

    console.log('Toggle donor status request:', { donorId, isActive, reason });

    if (!donorId) {
      return res.status(400).json({ error: 'Donor ID is required' });
    }

    const donor = await DonorModel.findById(donorId);
    if (!donor) {
      console.log('Donor not found:', donorId);
      return res.status(404).json({ error: 'Donor not found' });
    }

    console.log('Found donor:', { id: donor._id, name: donor.name, currentStatus: donor.isActive });

    // Update status
    donor.isActive = isActive !== undefined ? isActive : !donor.isActive;

    if (reason) {
      donor.eligibilityNotes = reason;
    }

    await donor.save();

    console.log('Updated donor status:', { id: donor._id, newStatus: donor.isActive });

    return res.json({
      message: `Donor ${donor.isActive ? 'activated' : 'deactivated'}`,
      donor: {
        id: donor._id,
        name: donor.name,
        email: donor.email,
        isActive: donor.isActive
      }
    });

  } catch (error) {
    console.error('Toggle donor status error:', error);
    return res.status(500).json({ error: 'Failed to update donor status' });
  }
}

// Delete donor (admin only)
export async function deleteDonor(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const donor = await DonorModel.findByIdAndDelete(id);
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    return res.json({ message: 'Donor deleted successfully' });
  } catch (error) {
    console.error('Delete donor error:', error);
    return res.status(500).json({ error: 'Failed to delete donor' });
  }
}

// Find eligible donors for a blood group
export async function findEligibleDonors(req: Request, res: Response) {
  try {
    const { bloodGroup, urgency = 'normal' } = req.query;

    if (!bloodGroup) {
      return res.status(400).json({ error: 'Blood group is required' });
    }

    const currentDate = new Date();
    let query: any = {
      bloodGroup: bloodGroup,
      status: 'active',
      nextEligibleDate: { $lte: currentDate }
    };

    // For urgent needs, also include donors who are close to eligibility
    if (urgency === 'urgent') {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      query.nextEligibleDate = { $lte: threeDaysFromNow };
    }

    const donors = await DonorModel.find(query)
      .select('name email phone bloodGroup donorType availability nextEligibleDate totalDonations')
      .sort({ nextEligibleDate: 1, totalDonations: -1 })
      .limit(20);

    return res.json({
      donors,
      count: donors.length,
      bloodGroup,
      urgency
    });
  } catch (error) {
    console.error('Find eligible donors error:', error);
    return res.status(500).json({ error: 'Failed to find eligible donors' });
  }
}

// Record a donation
export async function recordDonation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { units = 1, bloodBankLocation, notes } = req.body;

    const donor = await DonorModel.findById(id);
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    // Check if donor is eligible
    if (!donor.canDonate()) {
      return res.status(400).json({
        error: 'Donor is not eligible to donate at this time'
      });
    }

    // Record the donation
    const donationRecord = {
      date: new Date(),
      units,
      bloodBankLocation,
      notes
    };

    donor.donationHistory.push(donationRecord);
    donor.lastDonationDate = new Date();
    donor.totalDonations += 1;

    await donor.save();

    // Update inventory (add blood unit)
    // This would integrate with the inventory system

    return res.json({
      message: 'Donation recorded successfully',
      donation: donationRecord,
      donor: {
        name: donor.name,
        bloodGroup: donor.bloodGroup,
        totalDonations: donor.totalDonations,
        nextEligibleDate: donor.nextEligibleDate
      }
    });
  } catch (error) {
    console.error('Record donation error:', error);
    return res.status(500).json({ error: 'Failed to record donation' });
  }
}

// Get donor statistics
export async function getDonorStats(req: Request, res: Response) {
  try {
    const totalDonors = await DonorModel.countDocuments();
    
    // If no donors exist, return empty stats
    if (totalDonors === 0) {
      return res.json({
        stats: [],
        summary: {
          totalDonors: 0,
          activeDonors: 0,
          inactiveDonors: 0
        }
      });
    }

    const stats = await DonorModel.aggregate([
      {
        $group: {
          _id: '$bloodGroup',
          totalDonors: { $sum: 1 },
          activeDonors: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          regularDonors: {
            $sum: { $cond: [{ $eq: ['$donorType', 'regular'] }, 1, 0] }
          },
          emergencyDonors: {
            $sum: { $cond: [{ $eq: ['$donorType', 'emergency'] }, 1, 0] }
          },
          flexibleDonors: {
            $sum: { $cond: [{ $eq: ['$donorType', 'flexible'] }, 1, 0] }
          },
          avgDonations: { $avg: '$totalDonations' }
        }
      },
      { $sort: { totalDonors: -1 } }
    ]);

    const activeDonors = await DonorModel.countDocuments({ status: 'active' });

    return res.json({
      stats: stats || [],
      summary: {
        totalDonors,
        activeDonors,
        inactiveDonors: totalDonors - activeDonors
      }
    });
  } catch (error) {
    console.error('Get donor stats error:', error);
    return res.status(500).json({ error: 'Failed to get donor statistics' });
  }
}

// Get donor eligibility status
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
