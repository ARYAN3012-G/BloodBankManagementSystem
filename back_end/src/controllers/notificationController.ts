import { Request, Response } from 'express';
import { NotificationModel, NotificationDocument } from '../models/Notification';
import { DonorModel } from '../models/Donor';
import { RequestModel } from '../models/Request';
import { AppointmentModel } from '../models/Appointment';

// Send donation request notifications to selected donors
export async function sendDonationRequestNotifications(req: Request, res: Response) {
  try {
    const { requestId, donorIds, message, priority = 'normal', expiresInHours = 24 } = req.body;
    const adminId = req.user?.sub;

    if (!requestId || !donorIds || !Array.isArray(donorIds) || donorIds.length === 0) {
      return res.status(400).json({ error: 'Request ID and donor IDs are required' });
    }

    // Get request details
    const bloodRequest = await RequestModel.findById(requestId);
    if (!bloodRequest) {
      return res.status(404).json({ error: 'Blood request not found' });
    }

    // Get donor details
    const donors = await DonorModel.find({ _id: { $in: donorIds } });
    if (donors.length === 0) {
      return res.status(404).json({ error: 'No valid donors found' });
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Create notifications for each donor
    const notifications = [];
    for (const donor of donors) {
      console.log('Creating notification for donor:', donor._id, donor.name);
      
      const notification = await NotificationModel.create({
        type: 'donation_request',
        priority,
        title: `${priority === 'urgent' ? '🚨 URGENT: ' : ''}Blood Donation Needed`,
        message: message || `We need ${bloodRequest.bloodGroup} blood for a patient. Can you help?`,
        recipientId: donor._id,
        recipientType: 'donor',
        requestId: bloodRequest._id,
        expiresAt,
        createdBy: adminId,
        metadata: {
          bloodGroup: bloodRequest.bloodGroup,
          unitsNeeded: bloodRequest.unitsRequested,
          hospitalName: bloodRequest.hospitalName,
          urgencyLevel: bloodRequest.urgency
        }
      });
      
      console.log('Created notification:', notification._id, 'for donor:', donor._id);
      notifications.push(notification);
    }

    // Update request with notification count
    await RequestModel.findByIdAndUpdate(requestId, {
      $inc: { donorsNotified: donors.length }
    });

    return res.status(201).json({
      message: `Notifications sent to ${donors.length} donors`,
      notifications: notifications.map(n => ({
        id: n._id,
        donorId: n.recipientId,
        status: n.status,
        expiresAt: n.expiresAt
      }))
    });
  } catch (error) {
    console.error('Send notification error:', error);
    return res.status(500).json({ error: 'Failed to send notifications' });
  }
}

// Get notifications for a donor
export async function getDonorNotifications(req: Request, res: Response) {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find donor by userId
    const donor = await DonorModel.findOne({ userId });
    if (!donor) {
      return res.status(404).json({ error: 'Donor profile not found' });
    }

    const { status, limit = 20, page = 1 } = req.query;
    
    let query: any = { recipientId: donor._id };
    if (status) {
      query.status = status;
    }

    const notifications = await NotificationModel.find(query)
      .populate('requestId', 'bloodGroup unitsRequested urgency hospitalName requiredBy')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await NotificationModel.countDocuments(query);

    return res.json({
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get donor notifications error:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

// Respond to a donation request notification
export async function respondToNotification(req: Request, res: Response) {
  try {
    const { notificationId } = req.params;
    const { action, message, preferredSlots } = req.body;
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!['accept', 'decline', 'maybe'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be accept, decline, or maybe' });
    }

    // Find donor
    const donor = await DonorModel.findOne({ userId });
    if (!donor) {
      return res.status(404).json({ error: 'Donor profile not found' });
    }

    // Find notification
    const notification = await NotificationModel.findOne({
      _id: notificationId,
      recipientId: donor._id,
      status: { $in: ['pending', 'sent'] }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found or already responded' });
    }

    // Check if notification has expired
    if (notification.expiresAt && notification.expiresAt < new Date()) {
      await NotificationModel.findByIdAndUpdate(notificationId, { status: 'expired' });
      return res.status(400).json({ error: 'Notification has expired' });
    }

    // Update notification with response
    notification.response = {
      action,
      message,
      preferredSlots: preferredSlots ? preferredSlots.map((slot: string) => new Date(slot)) : undefined,
      respondedAt: new Date()
    };
    notification.status = 'responded';
    notification.respondedAt = new Date();
    await notification.save();

    // Update request statistics
    if (notification.requestId) {
      await RequestModel.findByIdAndUpdate(notification.requestId, {
        $inc: { donorsResponded: 1 }
      });
    }

    return res.json({
      message: `Response recorded: ${action}`,
      notification: {
        id: notification._id,
        status: notification.status,
        response: notification.response
      }
    });
  } catch (error) {
    console.error('Respond to notification error:', error);
    return res.status(500).json({ error: 'Failed to respond to notification' });
  }
}

// Mark notification as read
export async function markNotificationAsRead(req: Request, res: Response) {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find donor
    const donor = await DonorModel.findOne({ userId });
    if (!donor) {
      return res.status(404).json({ error: 'Donor profile not found' });
    }

    // Update notification
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: notificationId, recipientId: donor._id },
      { 
        status: 'read',
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.json({
      message: 'Notification marked as read',
      notification: {
        id: notification._id,
        status: notification.status,
        readAt: notification.readAt
      }
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return res.status(500).json({ error: 'Failed to mark notification as read' });
  }
}

// Get notification responses for a request (admin view)
export async function getRequestNotificationResponses(req: Request, res: Response) {
  try {
    const { requestId } = req.params;

    const notifications = await NotificationModel.find({ requestId })
      .populate({
        path: 'recipientId',
        select: 'name email phone bloodGroup donorType',
        model: 'Donor'
      })
      .sort({ createdAt: -1 });

    console.log('Found notifications:', notifications.length);
    console.log('First notification:', notifications[0]);
    console.log('First notification recipientId:', notifications[0]?.recipientId);

    const summary = {
      total: notifications.length,
      pending: notifications.filter(n => n.status === 'pending').length,
      sent: notifications.filter(n => n.status === 'sent').length,
      read: notifications.filter(n => n.status === 'read').length,
      responded: notifications.filter(n => n.status === 'responded').length,
      expired: notifications.filter(n => n.status === 'expired').length,
      responses: {
        accept: notifications.filter(n => n.response?.action === 'accept').length,
        decline: notifications.filter(n => n.response?.action === 'decline').length,
        maybe: notifications.filter(n => n.response?.action === 'maybe').length
      }
    };

    return res.json({
      summary,
      notifications: notifications.map(n => ({
        _id: n._id,
        recipientId: n.recipientId,
        status: n.status,
        response: n.response,
        sentAt: n.sentAt,
        readAt: n.readAt,
        respondedAt: n.respondedAt,
        expiresAt: n.expiresAt
      }))
    });
  } catch (error) {
    console.error('Get request notification responses error:', error);
    return res.status(500).json({ error: 'Failed to fetch notification responses' });
  }
}
