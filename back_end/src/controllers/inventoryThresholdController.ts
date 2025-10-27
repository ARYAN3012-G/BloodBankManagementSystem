import { Request, Response } from 'express';
import { InventoryModel } from '../models/Inventory';
import { InventoryThresholdModel } from '../models/InventoryThreshold';
import { DonorModel } from '../models/Donor';
import { sendDonationRequestNotifications } from './notificationController';

interface ThresholdSettings {
  bloodGroup: string;
  minUnits: number;
  targetUnits: number;
  isActive: boolean;
}

// Default thresholds for each blood group
const DEFAULT_THRESHOLDS: ThresholdSettings[] = [
  { bloodGroup: 'A+', minUnits: 10, targetUnits: 25, isActive: true },
  { bloodGroup: 'A-', minUnits: 5, targetUnits: 15, isActive: true },
  { bloodGroup: 'B+', minUnits: 10, targetUnits: 25, isActive: true },
  { bloodGroup: 'B-', minUnits: 5, targetUnits: 15, isActive: true },
  { bloodGroup: 'AB+', minUnits: 3, targetUnits: 10, isActive: true },
  { bloodGroup: 'AB-', minUnits: 2, targetUnits: 8, isActive: true },
  { bloodGroup: 'O+', minUnits: 15, targetUnits: 35, isActive: true },
  { bloodGroup: 'O-', minUnits: 8, targetUnits: 20, isActive: true },
];

// Check inventory levels and trigger donor notifications
export async function checkInventoryThresholds(req: Request, res: Response) {
  try {
    const inventory = await InventoryModel.find({});
    const lowStockAlerts = [];
    const donorNotifications = [];

    for (const item of inventory) {
      const threshold = DEFAULT_THRESHOLDS.find(t => t.bloodGroup === item.bloodGroup);
      
      if (!threshold || !threshold.isActive) continue;

      // Check if inventory is below minimum threshold
      if (item.units < threshold.minUnits) {
        lowStockAlerts.push({
          bloodGroup: item.bloodGroup,
          currentUnits: item.units,
          minRequired: threshold.minUnits,
          targetUnits: threshold.targetUnits,
          shortage: threshold.minUnits - item.units
        });

        // Find eligible donors for this blood group
        const eligibleDonors = await DonorModel.find({
          bloodGroup: item.bloodGroup,
          isActive: true,
          isAvailable: true,
          eligibilityStatus: 'eligible',
          $or: [
            { lastDonationDate: { $exists: false } },
            { lastDonationDate: { $lt: new Date(Date.now() - 56 * 24 * 60 * 60 * 1000) } } // 8 weeks ago
          ]
        }).populate('userId', 'name email');

        if (eligibleDonors.length > 0) {
          // Create donation request for inventory replenishment
          const donationRequest = {
            bloodGroup: item.bloodGroup,
            unitsNeeded: threshold.targetUnits - item.units,
            urgency: item.units < (threshold.minUnits / 2) ? 'Critical' : 'High',
            requestType: 'inventory_replenishment',
            reason: `Low inventory alert: Only ${item.units} units remaining (minimum: ${threshold.minUnits})`,
            eligibleDonors: eligibleDonors.slice(0, 10) // Limit to 10 donors per request
          };

          donorNotifications.push(donationRequest);
        }
      }
    }

    // Send notifications to eligible donors
    for (const notification of donorNotifications) {
      try {
        await sendInventoryReplenishmentNotifications(notification);
      } catch (error) {
        console.error('Failed to send inventory notification:', error);
      }
    }

    return res.json({
      message: 'Inventory threshold check completed',
      lowStockAlerts,
      notificationsSent: donorNotifications.length,
      details: donorNotifications
    });

  } catch (error) {
    console.error('Inventory threshold check error:', error);
    return res.status(500).json({ error: 'Failed to check inventory thresholds' });
  }
}

// Send notifications to donors for inventory replenishment
async function sendInventoryReplenishmentNotifications(request: any) {
  const notificationData = {
    bloodGroup: request.bloodGroup,
    unitsNeeded: request.unitsNeeded,
    urgency: request.urgency,
    message: `🩸 URGENT: We need ${request.bloodGroup} blood donors! Current stock is critically low (${request.reason}). Your donation can save lives!`,
    requestType: 'inventory_replenishment',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  };

  // Send notifications to eligible donors
  for (const donor of request.eligibleDonors) {
    try {
      // This would integrate with your existing notification system
      console.log(`Sending inventory alert to ${donor.userId.name} (${donor.userId.email}) for ${request.bloodGroup}`);
      
      // You can integrate with email/SMS services here
      // await sendEmail(donor.userId.email, 'Urgent Blood Donation Needed', notificationData.message);
      // await sendSMS(donor.phone, notificationData.message);
      
    } catch (error) {
      console.error(`Failed to notify donor ${donor.userId.name}:`, error);
    }
  }
}

// Initialize default thresholds in database
export async function initializeThresholds() {
  try {
    const existingCount = await InventoryThresholdModel.countDocuments();
    
    if (existingCount === 0) {
      // Insert default thresholds
      for (const threshold of DEFAULT_THRESHOLDS) {
        await InventoryThresholdModel.create({
          bloodGroup: threshold.bloodGroup,
          minimumUnits: threshold.minUnits,
          targetUnits: threshold.targetUnits,
          alertEnabled: threshold.isActive
        });
      }
      console.log('Initialized default inventory thresholds');
    }
  } catch (error) {
    console.error('Error initializing thresholds:', error);
  }
}

// Get current threshold settings
export async function getThresholdSettings(req: Request, res: Response) {
  try {
    let thresholds = await InventoryThresholdModel.find({}).sort({ bloodGroup: 1 });
    
    // If no thresholds exist, initialize with defaults
    if (thresholds.length === 0) {
      await initializeThresholds();
      thresholds = await InventoryThresholdModel.find({}).sort({ bloodGroup: 1 });
    }
    
    return res.json(thresholds);
  } catch (error) {
    console.error('Get threshold settings error:', error);
    return res.status(500).json({ error: 'Failed to get threshold settings' });
  }
}

// Update threshold settings
export async function updateThresholdSettings(req: Request, res: Response) {
  try {
    const { bloodGroup, minimumUnits, targetUnits, alertEnabled } = req.body;
    
    // Validate
    if (!bloodGroup) {
      return res.status(400).json({ error: 'Blood group is required' });
    }

    // Update or create threshold
    const threshold = await InventoryThresholdModel.findOneAndUpdate(
      { bloodGroup },
      { minimumUnits, targetUnits, alertEnabled },
      { new: true, upsert: true }
    );

    return res.json({
      message: 'Threshold settings updated successfully',
      threshold
    });
  } catch (error) {
    console.error('Update threshold settings error:', error);
    return res.status(500).json({ error: 'Failed to update threshold settings' });
  }
}

// Get inventory status with threshold analysis
export async function getInventoryWithThresholds(req: Request, res: Response) {
  try {
    const inventory = await InventoryModel.find({});
    let thresholds = await InventoryThresholdModel.find({});
    
    // Initialize thresholds if none exist
    if (thresholds.length === 0) {
      await initializeThresholds();
      thresholds = await InventoryThresholdModel.find({});
    }
    
    const inventoryWithStatus = inventory.map(item => {
      const threshold = thresholds.find(t => t.bloodGroup === item.bloodGroup);
      
      let status = 'normal';
      let statusColor = 'success';
      let message = 'Stock levels are adequate';

      if (threshold && threshold.alertEnabled) {
        if (item.units < threshold.minimumUnits / 2) {
          status = 'critical';
          statusColor = 'error';
          message = `CRITICAL: Only ${item.units} units remaining!`;
        } else if (item.units < threshold.minimumUnits) {
          status = 'low';
          statusColor = 'warning';
          message = `LOW: ${item.units} units (minimum: ${threshold.minimumUnits})`;
        } else if (item.units >= threshold.targetUnits) {
          status = 'optimal';
          statusColor = 'success';
          message = `OPTIMAL: ${item.units} units available`;
        }
      }

      return {
        ...item.toObject(),
        threshold: threshold ? {
          minimumUnits: threshold.minimumUnits,
          targetUnits: threshold.targetUnits,
          alertEnabled: threshold.alertEnabled
        } : null,
        status,
        statusColor,
        message,
        needsDonors: threshold ? item.units < threshold.minimumUnits : false
      };
    });

    return res.json(inventoryWithStatus);
  } catch (error) {
    console.error('Get inventory with thresholds error:', error);
    return res.status(500).json({ error: 'Failed to get inventory status' });
  }
}
