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
    
    return res.json(donors);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch donors' });
  }
}


