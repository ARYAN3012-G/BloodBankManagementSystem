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
    
    // Check if request is in valid state
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending requests can be marked as inventory satisfied' });
    }
    
    // Check if inventory is now sufficient (sum all lots)
    const inventoryLots = await InventoryModel.find({ 
      bloodGroup: request.bloodGroup,
      units: { $gt: 0 }
    });
    
    const availableUnits = inventoryLots.reduce((total, lot) => total + lot.units, 0);
    
    console.log(`Inventory check for ${request.bloodGroup}:`);
    console.log(`- Available lots: ${inventoryLots.length}`);
    console.log(`- Total available units: ${availableUnits}`);
    console.log(`- Units requested: ${request.unitsRequested}`);
    
    if (availableUnits < request.unitsRequested) {
      console.log(`❌ Insufficient inventory: ${availableUnits} < ${request.unitsRequested}`);
      return res.status(400).json({ 
        error: `Insufficient inventory. Available: ${availableUnits} units, Required: ${request.unitsRequested} units`,
        availableUnits,
        requiredUnits: request.unitsRequested
      });
    }
    
    console.log(`✅ Sufficient inventory. Updating request status to 'completed'`);
    
    // Mark as completed (donation flow complete, ready for hospital collection scheduling)
    request.status = 'completed';
    request.unitsCollected = request.unitsRequested;
    request.updatedAt = new Date();
    
    await request.save();
    
    console.log(`✅ Request ${request._id} successfully updated to completed status`);
    
    return res.json({
      message: 'Inventory satisfied. Request moved to "Ready for Collection" tab.',
      request
    });
  } catch (error) {
    console.error('Mark inventory satisfied error:', error);
    return res.status(500).json({ error: 'Failed to mark inventory as satisfied' });
  }
}
