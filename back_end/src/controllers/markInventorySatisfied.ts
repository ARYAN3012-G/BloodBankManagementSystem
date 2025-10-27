import { Request, Response } from 'express';
import { RequestModel } from '../models/Request';
import { InventoryModel } from '../models/Inventory';

/**
 * Mark donation flow as complete - inventory is now satisfied
 * Move request to "Ready for Collection" status
 */
export async function markInventorySatisfied(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const request = await RequestModel.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Check if request is in valid state (allow pending/approved/reschedule-requested)
    const allowedStatuses = ['pending', 'approved', 'reschedule-requested'];
    if (!allowedStatuses.includes(request.status)) {
      return res.status(400).json({ error: 'Only pending/approved requests can be marked as inventory satisfied' });
    }
    
    // Check if inventory is now sufficient (sum all lots)
    const inventoryLots = await InventoryModel.find({ 
      bloodGroup: request.bloodGroup,
      units: { $gt: 0 }
    }).populate('donorId', 'name');
    
    const availableUnits = inventoryLots.reduce((total, lot) => total + lot.units, 0);
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 INVENTORY CHECK FOR REQUEST ${request._id}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`🩸 Blood Group: ${request.bloodGroup}`);
    console.log(`📊 Available lots: ${inventoryLots.length}`);
    console.log(`📈 Total available units: ${availableUnits}`);
    console.log(`📋 Units requested: ${request.unitsRequested}`);
    console.log(`\n📦 Inventory Lots Details:`);
    inventoryLots.forEach((lot: any, idx: number) => {
      console.log(`  Lot ${idx + 1}:`);
      console.log(`    - ID: ${lot._id}`);
      console.log(`    - Units: ${lot.units}`);
      console.log(`    - Donor: ${lot.donorId?.name || 'N/A'}`);
      console.log(`    - Location: ${lot.location}`);
      console.log(`    - Expiry: ${lot.expiryDate?.toLocaleDateString()}`);
      console.log(`    - Collection Date: ${lot.collectionDate?.toLocaleDateString()}`);
    });
    console.log(`${'='.repeat(60)}\n`);
    
    if (availableUnits < request.unitsRequested) {
      console.log(`❌ Insufficient inventory: ${availableUnits} < ${request.unitsRequested}`);
      return res.status(400).json({ 
        error: `Insufficient inventory. Available: ${availableUnits} units, Required: ${request.unitsRequested} units`,
        availableUnits,
        requiredUnits: request.unitsRequested
      });
    }
    
    console.log(`✅ Sufficient inventory. Marking request as ready for review.`);
    
    // Mark inventory as satisfied (keeping status as pending/approved for admin review)
    // Status will be changed to 'approved' when admin reviews and approves via the UI
    request.unitsCollected = request.unitsRequested;
    request.updatedAt = new Date();
    request.usedDonationFlow = true;
    // Reset reschedule flags if any
    request.rescheduleRequested = false;
    
    // Set default collection details if not already set (admin can modify during review)
    if (!request.collectionDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      request.collectionDate = tomorrow;
    }
    if (!request.collectionLocation) {
      request.collectionLocation = 'Arts Blood Foundation - Main Center';
    }
    if (!request.collectionInstructions) {
      request.collectionInstructions = `Blood ready for collection. ${request.unitsRequested} unit(s) of ${request.bloodGroup} available. Please bring valid ID and request confirmation.`;
    }
    
    await request.save();
    
    console.log(`✅ Request ${request._id} marked as ready for admin review`);
    
    return res.json({
      message: 'Inventory satisfied. Redirecting to review page.',
      request
    });
  } catch (error) {
    console.error('Mark inventory satisfied error:', error);
    return res.status(500).json({ error: 'Failed to mark inventory as satisfied' });
  }
}
