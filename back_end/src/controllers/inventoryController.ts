import { Request, Response } from 'express';
import { InventoryModel } from '../models/Inventory';
import { DonorModel } from '../models/Donor';

export async function getStock(_req: Request, res: Response) {
  try {
    const stock = await InventoryModel.find()
      .populate({
        path: 'donorId',
        populate: { path: 'userId', select: 'name email' }
      })
      .sort({ bloodGroup: 1, expiryDate: 1 });
    
    // Group by blood group and sum units
    const summary = stock.reduce((acc: any, item) => {
      if (!acc[item.bloodGroup]) {
        acc[item.bloodGroup] = { bloodGroup: item.bloodGroup, totalUnits: 0, lots: [] };
      }
      acc[item.bloodGroup].totalUnits += item.units;
      acc[item.bloodGroup].lots.push(item);
      return acc;
    }, {});
    
    return res.json({ stock, summary: Object.values(summary) });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch inventory' });
  }
}

export async function addUnits(req: Request, res: Response) {
  try {
    const { bloodGroup, units, expiryDate, location, donorId, collectionDate } = req.body;
    
    if (!bloodGroup || !units || !expiryDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (units < 1) {
      return res.status(400).json({ error: 'Units must be at least 1' });
    }
    
    const expiry = new Date(expiryDate);
    if (expiry <= new Date()) {
      return res.status(400).json({ error: 'Expiry date must be in the future' });
    }
    
    // If donor is specified, update their donation record
    if (donorId) {
      const donor = await DonorModel.findById(donorId);
      if (!donor) {
        return res.status(404).json({ error: 'Donor not found' });
      }
      
      // Verify blood group matches
      if (donor.bloodGroup !== bloodGroup) {
        return res.status(400).json({ 
          error: `Blood group mismatch. Donor is ${donor.bloodGroup}, but ${bloodGroup} was specified` 
        });
      }
      
      // Update donor's donation history
      const donationDate = collectionDate ? new Date(collectionDate) : new Date();
      donor.lastDonationDate = donationDate;
      donor.donationHistory.push({
        date: donationDate,
        units: units
      });
      await donor.save();
    }
    
    const record = await InventoryModel.create({ 
      bloodGroup, 
      units, 
      expiryDate: expiry, 
      location,
      donorId: donorId || undefined,
      collectionDate: collectionDate ? new Date(collectionDate) : new Date()
    });
    
    return res.status(201).json(record);
  } catch (error) {
    console.error('Add inventory error:', error);
    return res.status(500).json({ error: 'Failed to add inventory' });
  }
}


