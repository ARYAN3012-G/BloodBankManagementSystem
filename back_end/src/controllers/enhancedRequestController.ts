import { Request, Response } from 'express';
import { RequestModel } from '../models/Request';
import { DonorModel } from '../models/Donor';
import { InventoryModel } from '../models/Inventory';

// Get suitable donors for a blood request
export async function getSuitableDonorsForRequest(req: Request, res: Response) {
  try {
    const { requestId } = req.params;
    const { urgency = 'normal' } = req.query;

    // Get request details
    const bloodRequest = await RequestModel.findById(requestId);
    if (!bloodRequest) {
      return res.status(404).json({ error: 'Blood request not found' });
    }

    // Check current inventory
    const inventoryItems = await InventoryModel.find({ bloodGroup: bloodRequest.bloodGroup });
    const availableUnits = inventoryItems.reduce((total, item) => total + item.units, 0);
    const unitsNeeded = Math.max(0, bloodRequest.unitsRequested - availableUnits);

    if (unitsNeeded === 0) {
      return res.json({
        message: 'Sufficient inventory available, no donors needed',
        inventoryStatus: {
          available: availableUnits,
          requested: bloodRequest.unitsRequested,
          shortage: 0
        },
        donors: []
      });
    }

    // Find eligible donors
    const currentDate = new Date();
    let eligibilityQuery: any = {
      bloodGroup: bloodRequest.bloodGroup,
      status: 'active',
      verificationStatus: 'verified',
      isActive: true,
      isAvailable: true,
      $or: [
        { nextEligibleDate: { $lte: currentDate } },
        { nextEligibleDate: { $exists: false } },
        { lastDonationDate: { $exists: false } }
      ]
    };

    // For urgent requests, include donors close to eligibility
    if (urgency === 'urgent') {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      eligibilityQuery.$or.push({ nextEligibleDate: { $lte: threeDaysFromNow } });
    }

    const donors = await DonorModel.find(eligibilityQuery)
      .select('name email phone bloodGroup donorType availability nextEligibleDate totalDonations lastDonationDate preferredLocations maxDistanceKm')
      .lean();

    // Calculate donor scores and prioritize
    const scoredDonors = donors.map(donor => {
      let score = 0;
      
      // Donor type priority
      if (donor.donorType === 'emergency') score += 30;
      else if (donor.donorType === 'flexible') score += 20;
      else score += 10; // regular
      
      // Experience (total donations)
      score += Math.min(donor.totalDonations * 2, 20);
      
      // Eligibility (already eligible vs future eligible)
      const daysUntilEligible = donor.nextEligibleDate ? 
        Math.ceil((new Date(donor.nextEligibleDate).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      if (daysUntilEligible <= 0) score += 25; // Already eligible
      else if (daysUntilEligible <= 3) score += 15; // Eligible soon
      else score += 5;
      
      // Availability preferences (basic scoring)
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
      const hour = now.getHours();
      
      if (donor.availability) {
        if ((dayOfWeek >= 1 && dayOfWeek <= 5) && donor.availability.weekdays) score += 5;
        if ((dayOfWeek === 0 || dayOfWeek === 6) && donor.availability.weekends) score += 5;
        if (hour < 12 && donor.availability.mornings) score += 3;
        if (hour >= 17 && donor.availability.evenings) score += 3;
      }

      return {
        ...donor,
        score,
        daysUntilEligible: Math.max(0, daysUntilEligible),
        isCurrentlyEligible: daysUntilEligible <= 0
      };
    });

    // Sort by score (highest first)
    scoredDonors.sort((a, b) => b.score - a.score);

    // Group by priority levels
    const prioritizedDonors = {
      highPriority: scoredDonors.filter(d => d.score >= 40).slice(0, 5),
      mediumPriority: scoredDonors.filter(d => d.score >= 25 && d.score < 40).slice(0, 8),
      lowPriority: scoredDonors.filter(d => d.score < 25).slice(0, 10)
    };

    return res.json({
      requestInfo: {
        id: bloodRequest._id,
        bloodGroup: bloodRequest.bloodGroup,
        unitsRequested: bloodRequest.unitsRequested,
        urgency: bloodRequest.urgency,
        requiredBy: bloodRequest.requiredBy,
        hospitalName: bloodRequest.hospitalName
      },
      inventoryStatus: {
        available: availableUnits,
        requested: bloodRequest.unitsRequested,
        shortage: unitsNeeded
      },
      donorRecommendations: {
        totalFound: scoredDonors.length,
        highPriority: prioritizedDonors.highPriority,
        mediumPriority: prioritizedDonors.mediumPriority,
        lowPriority: prioritizedDonors.lowPriority
      },
      suggestions: {
        recommendedToContact: Math.min(unitsNeeded * 3, 10), // Contact 3x the needed units
        urgencyLevel: urgency,
        bestTimeToContact: getBestContactTime()
      }
    });
  } catch (error) {
    console.error('Get suitable donors error:', error);
    return res.status(500).json({ error: 'Failed to find suitable donors' });
  }
}

// Enhanced request creation with donor matching
export async function createEnhancedRequest(req: Request, res: Response) {
  try {
    const {
      bloodGroup,
      unitsRequested,
      urgency = 'Medium',
      requiredBy,
      patientInfo,
      hospitalName,
      contactPerson,
      contactPhone,
      notes
    } = req.body;

    const userId = req.user?.sub;

    if (!bloodGroup || !unitsRequested) {
      return res.status(400).json({ error: 'Blood group and units requested are required' });
    }

    // Create request
    const request = await RequestModel.create({
      requesterUserId: userId,
      bloodGroup,
      unitsRequested,
      urgency,
      requiredBy: requiredBy ? new Date(requiredBy) : undefined,
      patientInfo,
      hospitalName,
      contactPerson,
      contactPhone,
      notes,
      status: 'pending'
    });

    // Immediately check inventory and find suitable donors
    const inventoryItems = await InventoryModel.find({ bloodGroup });
    const availableUnits = inventoryItems.reduce((total, item) => total + item.units, 0);
    const shortage = Math.max(0, unitsRequested - availableUnits);

    let donorSuggestions = null;
    if (shortage > 0) {
      // Find suitable donors
      const eligibilityQuery = {
        bloodGroup,
        status: 'active',
        verificationStatus: 'verified',
        isActive: true,
        isAvailable: true,
        $or: [
          { nextEligibleDate: { $lte: new Date() } },
          { nextEligibleDate: { $exists: false } }
        ]
      };

      const eligibleDonors = await DonorModel.countDocuments(eligibilityQuery);
      
      donorSuggestions = {
        shortage,
        eligibleDonors,
        recommendation: eligibleDonors >= shortage ? 
          'Sufficient eligible donors available' : 
          'Limited eligible donors - consider expanding search criteria'
      };
    }

    return res.status(201).json({
      message: 'Request created successfully',
      request: {
        id: request._id,
        bloodGroup: request.bloodGroup,
        unitsRequested: request.unitsRequested,
        urgency: request.urgency,
        status: request.status,
        createdAt: request.createdAt
      },
      inventoryStatus: {
        available: availableUnits,
        shortage
      },
      donorSuggestions
    });
  } catch (error) {
    console.error('Create enhanced request error:', error);
    return res.status(500).json({ error: 'Failed to create request' });
  }
}

// Get request dashboard data
export async function getRequestDashboard(req: Request, res: Response) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get request statistics
    const stats = await RequestModel.aggregate([
      {
        $facet: {
          statusCounts: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          urgencyBreakdown: [
            { $group: { _id: '$urgency', count: { $sum: 1 } } }
          ],
          bloodGroupNeeds: [
            {
              $match: { status: { $in: ['pending', 'approved'] } }
            },
            {
              $group: {
                _id: '$bloodGroup',
                totalUnits: { $sum: '$unitsRequested' },
                requests: { $sum: 1 }
              }
            }
          ],
          todayRequests: [
            {
              $match: {
                createdAt: { $gte: today, $lt: tomorrow }
              }
            },
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          donationProgress: [
            {
              $match: { status: { $ne: 'rejected' } }
            },
            {
              $group: {
                _id: null,
                totalRequested: { $sum: '$unitsRequested' },
                totalNotified: { $sum: '$donorsNotified' },
                totalResponded: { $sum: '$donorsResponded' },
                totalScheduled: { $sum: '$appointmentsScheduled' },
                totalCollected: { $sum: '$unitsCollected' }
              }
            }
          ]
        }
      }
    ]);

    const result = stats[0];
    const donationData = result.donationProgress[0] || {
      totalRequested: 0,
      totalNotified: 0,
      totalResponded: 0,
      totalScheduled: 0,
      totalCollected: 0
    };

    // Get recent requests needing attention
    const pendingRequests = await RequestModel.find({
      status: 'pending',
      $or: [
        { requiredBy: { $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) } }, // Due within 24 hours
        { urgency: { $in: ['High', 'Critical'] } }
      ]
    })
    .select('bloodGroup unitsRequested urgency requiredBy hospitalName createdAt')
    .sort({ urgency: -1, requiredBy: 1 })
    .limit(10);

    return res.json({
      summary: {
        statusCounts: result.statusCounts,
        urgencyBreakdown: result.urgencyBreakdown,
        todayRequests: result.todayRequests,
        bloodGroupNeeds: result.bloodGroupNeeds
      },
      donationFlow: {
        ...donationData,
        responseRate: donationData.totalNotified > 0 ? 
          ((donationData.totalResponded / donationData.totalNotified) * 100).toFixed(1) : '0',
        fulfillmentRate: donationData.totalRequested > 0 ? 
          ((donationData.totalCollected / donationData.totalRequested) * 100).toFixed(1) : '0'
      },
      urgentRequests: pendingRequests,
      recommendations: generateDashboardRecommendations(result, donationData)
    });
  } catch (error) {
    console.error('Get request dashboard error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}

// Helper functions
function getBestContactTime() {
  const hour = new Date().getHours();
  if (hour >= 9 && hour <= 11) return 'Current time is good (morning)';
  if (hour >= 14 && hour <= 17) return 'Current time is good (afternoon)';
  if (hour >= 18 && hour <= 20) return 'Current time is good (evening)';
  return 'Best to contact during 9-11 AM, 2-5 PM, or 6-8 PM';
}

function generateDashboardRecommendations(stats: any, donationData: any) {
  const recommendations = [];
  
  // Check response rates
  if (donationData.totalNotified > 0) {
    const responseRate = (donationData.totalResponded / donationData.totalNotified) * 100;
    if (responseRate < 30) {
      recommendations.push({
        type: 'warning',
        message: 'Low donor response rate. Consider improving notification messages or timing.'
      });
    }
  }
  
  // Check fulfillment rates
  if (donationData.totalRequested > 0) {
    const fulfillmentRate = (donationData.totalCollected / donationData.totalRequested) * 100;
    if (fulfillmentRate < 70) {
      recommendations.push({
        type: 'alert',
        message: 'Low request fulfillment rate. Consider expanding donor outreach.'
      });
    }
  }
  
  // Check urgent requests
  const urgentCount = stats.urgencyBreakdown.find((u: any) => u._id === 'Critical')?.count || 0;
  if (urgentCount > 0) {
    recommendations.push({
      type: 'urgent',
      message: `${urgentCount} critical requests need immediate attention.`
    });
  }
  
  return recommendations;
}

export { getBestContactTime, generateDashboardRecommendations };
