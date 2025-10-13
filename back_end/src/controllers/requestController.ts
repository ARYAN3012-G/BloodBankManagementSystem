import { Request, Response } from 'express';
import { RequestModel } from '../models/Request';
import { InventoryModel } from '../models/Inventory';

export async function createRequest(req: Request, res: Response) {
  try {
    const { 
      bloodGroup, 
      unitsRequested, 
      patientName, 
      medicalReportUrl, 
      notes, 
      urgency,
      contactNumber,
      hospitalPreference,
      department,
      staffId,
      doctorName
    } = req.body;
    
    if (!bloodGroup || !unitsRequested) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (unitsRequested < 1 || unitsRequested > 10) {
      return res.status(400).json({ error: 'Units requested must be between 1 and 10' });
    }
    
    const doc = await RequestModel.create({
      requesterUserId: req.user?.sub,
      bloodGroup,
      unitsRequested,
      patientName,
      urgency: urgency || 'Medium',
      medicalReportUrl,
      notes,
      contactNumber,
      hospitalPreference,
      department,
      staffId,
      doctorName,
    });
    
    return res.status(201).json(doc);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create request' });
  }
}

export async function listRequests(req: Request, res: Response) {
  try {
    const { status } = req.query;
    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    // If hospital/external, only show their own requests
    if (req.user?.role === 'hospital' || req.user?.role === 'external') {
      filter.requesterUserId = req.user.sub;
    }
    
    const requests = await RequestModel.find(filter)
      .populate('requesterUserId', 'name email role')
      .sort({ createdAt: -1 });
    
    // Log for debugging
    console.log(`Found ${requests.length} requests for role: ${req.user?.role}`);
      
    return res.json(requests);
  } catch (error) {
    console.error('List requests error:', error);
    return res.status(500).json({ error: 'Failed to fetch requests' });
  }
}

export async function approveAndAssign(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const request = await RequestModel.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    const available = await InventoryModel.find({ 
      bloodGroup: request.bloodGroup,
      units: { $gt: 0 }
    }).sort({ expiryDate: 1 });
    
    let remaining = request.unitsRequested;
    
    for (const lot of available) {
      if (remaining <= 0) break;
      const take = Math.min(remaining, lot.units);
      lot.units -= take;
      remaining -= take;
      await lot.save();
    }
    
    const assigned = request.unitsRequested - remaining;
    request.status = assigned >= request.unitsRequested ? 'approved' : 'pending';
    request.assignedUnits = assigned;
    
    // Set approval timestamp
    if (request.status === 'approved') {
      request.approvedOn = new Date();
    }
    
    await request.save();
    
    return res.json(request);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to approve request' });
  }
}

export async function rejectRequest(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const request = await RequestModel.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }
    
    request.status = 'rejected';
    request.rejectedOn = new Date();
    await request.save();
    
    return res.json(request);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to reject request' });
  }
}


