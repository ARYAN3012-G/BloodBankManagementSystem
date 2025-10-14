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
    const { collectionDate, collectionLocation, collectionInstructions } = req.body;
    
    // Validation
    if (!collectionDate || !collectionLocation) {
      return res.status(400).json({ error: 'Collection date and location are required' });
    }
    
    const request = await RequestModel.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.status !== 'pending' && request.status !== 'reschedule-requested') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    // If this is a reschedule request, inventory is already allocated
    // So we just update the collection details without deducting inventory again
    const isReschedule = request.status === 'reschedule-requested';
    
    let assigned = request.assignedUnits || 0;
    
    // Only deduct inventory if this is a NEW approval (not reschedule)
    if (!isReschedule) {
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
      
      assigned = request.unitsRequested - remaining;
      
      // Check if we have enough inventory
      if (assigned < request.unitsRequested) {
        return res.status(400).json({ 
          error: `Insufficient inventory. Only ${assigned} unit(s) available, but ${request.unitsRequested} unit(s) requested.` 
        });
      }
    }
    
    // We have enough inventory (or it's already allocated), approve the request
    request.status = 'approved';
    request.assignedUnits = assigned;
    request.approvedOn = new Date();
    request.collectionDate = new Date(collectionDate);
    request.collectionLocation = collectionLocation;
    request.collectionInstructions = collectionInstructions;
    
    // If this was a reschedule request, update accordingly
    if (isReschedule) {
      request.rescheduleApproved = true;
      request.rescheduleRequested = false;
    }
    
    await request.save();
    
    console.log(`Request ${id} approved. Reschedule: ${isReschedule}, Inventory deducted: ${!isReschedule}`);
    
    return res.json(request);
  } catch (error) {
    console.error('Approve request error:', error);
    return res.status(500).json({ error: 'Failed to approve request' });
  }
}

export async function rejectRequest(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    // Validation
    if (!rejectionReason || rejectionReason.trim() === '') {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
    
    const request = await RequestModel.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.status !== 'pending' && request.status !== 'reschedule-requested') {
      return res.status(400).json({ error: 'Request already processed' });
    }
    
    request.status = 'rejected';
    request.rejectedOn = new Date();
    request.rejectionReason = rejectionReason;
    await request.save();
    
    return res.json(request);
  } catch (error) {
    console.error('Reject request error:', error);
    return res.status(500).json({ error: 'Failed to reject request' });
  }
}

// USER ACTIONS

/**
 * User confirms they collected the blood
 */
export async function confirmCollection(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.sub;
    
    const request = await RequestModel.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Verify user owns this request
    if (request.requesterUserId?.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    if (request.status !== 'approved') {
      return res.status(400).json({ error: 'Request must be approved to confirm collection' });
    }
    
    request.status = 'collected';
    request.collectedAt = new Date();
    request.collectedByUserConfirmation = true;
    await request.save();
    
    return res.json({ 
      message: 'Collection confirmed successfully. Thank you!',
      request 
    });
  } catch (error) {
    console.error('Confirm collection error:', error);
    return res.status(500).json({ error: 'Failed to confirm collection' });
  }
}

/**
 * User requests to reschedule collection date
 */
export async function requestReschedule(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { newDate, reason } = req.body;
    const userId = req.user?.sub;
    
    if (!newDate) {
      return res.status(400).json({ error: 'New collection date is required' });
    }
    
    const request = await RequestModel.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Verify user owns this request
    if (request.requesterUserId?.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    if (request.status !== 'approved') {
      return res.status(400).json({ error: 'Only approved requests can be rescheduled' });
    }
    
    request.status = 'reschedule-requested';
    request.rescheduleRequested = true;
    request.originalCollectionDate = request.collectionDate;
    request.newRequestedDate = new Date(newDate);
    request.rescheduleReason = reason;
    await request.save();
    
    return res.json({ 
      message: 'Reschedule request submitted. Waiting for admin approval.',
      request 
    });
  } catch (error) {
    console.error('Request reschedule error:', error);
    return res.status(500).json({ error: 'Failed to request reschedule' });
  }
}

/**
 * User cancels their blood request
 */
export async function cancelRequest(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.sub;
    
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ error: 'Cancellation reason is required' });
    }
    
    const request = await RequestModel.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Verify user owns this request
    if (request.requesterUserId?.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    if (request.status === 'collected' || request.status === 'verified' || request.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot cancel this request' });
    }
    
    // If approved, restore inventory
    if (request.status === 'approved') {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 35);
      
      await InventoryModel.create({
        bloodGroup: request.bloodGroup,
        units: request.assignedUnits || request.unitsRequested,
        expiryDate,
        location: 'Restored from cancelled request',
        collectionDate: new Date(),
      });
    }
    
    request.status = 'cancelled';
    request.cancelledAt = new Date();
    request.cancellationReason = reason;
    await request.save();
    
    return res.json({ 
      message: 'Request cancelled successfully. Inventory has been restored.',
      request 
    });
  } catch (error) {
    console.error('Cancel request error:', error);
    return res.status(500).json({ error: 'Failed to cancel request' });
  }
}

// ADMIN ACTIONS

/**
 * Admin verifies that user collected the blood
 */
export async function verifyCollection(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const adminUserId = req.user?.sub;
    
    const request = await RequestModel.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.status !== 'collected') {
      return res.status(400).json({ error: 'Request must be in collected status' });
    }
    
    request.status = 'verified';
    request.verifiedByAdmin = true;
    request.verifiedAt = new Date();
    request.verifiedByUserId = adminUserId as any;
    await request.save();
    
    return res.json({ 
      message: 'Collection verified successfully',
      request 
    });
  } catch (error) {
    console.error('Verify collection error:', error);
    return res.status(500).json({ error: 'Failed to verify collection' });
  }
}

/**
 * Admin manually marks request as collected
 */
export async function markAsCollected(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const request = await RequestModel.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.status !== 'approved') {
      return res.status(400).json({ error: 'Request must be approved' });
    }
    
    request.status = 'collected';
    request.collectedAt = new Date();
    request.collectedByUserConfirmation = false; // Admin marked, not user
    await request.save();
    
    return res.json({ 
      message: 'Marked as collected successfully',
      request 
    });
  } catch (error) {
    console.error('Mark as collected error:', error);
    return res.status(500).json({ error: 'Failed to mark as collected' });
  }
}

/**
 * Admin marks request as no-show
 */
export async function markAsNoShow(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const request = await RequestModel.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.status !== 'approved') {
      return res.status(400).json({ error: 'Only approved requests can be marked as no-show' });
    }
    
    // Restore inventory
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 35);
    
    await InventoryModel.create({
      bloodGroup: request.bloodGroup,
      units: request.assignedUnits || request.unitsRequested,
      expiryDate,
      location: 'Restored from no-show',
      collectionDate: new Date(),
    });
    
    request.status = 'no-show';
    request.noShowDetectedAt = new Date();
    request.noShowReason = reason || 'Marked as no-show by admin';
    await request.save();
    
    return res.json({ 
      message: 'Marked as no-show. Inventory restored.',
      request 
    });
  } catch (error) {
    console.error('Mark as no-show error:', error);
    return res.status(500).json({ error: 'Failed to mark as no-show' });
  }
}

/**
 * Admin approves or denies reschedule request
 */
export async function handleReschedule(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { approved, newDate } = req.body;
    
    const request = await RequestModel.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.status !== 'reschedule-requested') {
      return res.status(400).json({ error: 'No reschedule request found' });
    }
    
    if (approved) {
      // Approve reschedule
      request.status = 'approved';
      request.collectionDate = newDate ? new Date(newDate) : request.newRequestedDate;
      request.rescheduleApproved = true;
      request.rescheduleRequested = false;
    } else {
      // Deny reschedule - keep original date
      request.status = 'approved';
      request.collectionDate = request.originalCollectionDate;
      request.rescheduleRequested = false;
      request.rescheduleApproved = false;
    }
    
    await request.save();
    
    return res.json({ 
      message: approved ? 'Reschedule approved' : 'Reschedule denied',
      request 
    });
  } catch (error) {
    console.error('Handle reschedule error:', error);
    return res.status(500).json({ error: 'Failed to handle reschedule' });
  }
}

/**
 * System/Cron job to check and mark no-shows
 */
export async function checkNoShows(req: Request, res: Response) {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);
    
    const overdueRequests = await RequestModel.find({
      status: 'approved',
      collectionDate: { $lte: yesterday }
    });
    
    let count = 0;
    for (const request of overdueRequests) {
      // Restore inventory
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 35);
      
      await InventoryModel.create({
        bloodGroup: request.bloodGroup,
        units: request.assignedUnits || request.unitsRequested,
        expiryDate,
        location: 'Restored from auto no-show',
        collectionDate: new Date(),
      });
      
      request.status = 'no-show';
      request.noShowDetectedAt = new Date();
      request.noShowReason = 'Automatic: Did not collect on scheduled date';
      await request.save();
      count++;
    }
    
    return res.json({ 
      message: `Checked for no-shows. Marked ${count} request(s) as no-show.`,
      count 
    });
  } catch (error) {
    console.error('Check no-shows error:', error);
    return res.status(500).json({ error: 'Failed to check no-shows' });
  }
}


