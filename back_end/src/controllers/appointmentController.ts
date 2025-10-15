import { Request, Response } from 'express';
import { AppointmentModel, AppointmentDocument } from '../models/Appointment';
import { NotificationModel } from '../models/Notification';
import { DonorModel } from '../models/Donor';
import { RequestModel } from '../models/Request';

// Create appointment from notification response
export async function createAppointmentFromNotification(req: Request, res: Response) {
  try {
    const { notificationId, scheduledDate, scheduledTime, location, donorNotes } = req.body;
    const adminId = req.user?.sub;

    if (!notificationId || !scheduledDate || !scheduledTime || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get notification with donor and request details
    const notification = await NotificationModel.findById(notificationId)
      .populate('recipientId')
      .populate('requestId');

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.response?.action !== 'accept') {
      return res.status(400).json({ error: 'Donor has not accepted the donation request' });
    }

    const donor = notification.recipientId as any;
    const request = notification.requestId as any;

    // Create appointment
    const appointment = await AppointmentModel.create({
      donorId: donor._id,
      requestId: request?._id,
      notificationId: notification._id,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      location,
      bloodGroup: donor.bloodGroup,
      unitsExpected: 1,
      donorNotes,
      createdBy: adminId,
      type: 'reactive',
      status: 'scheduled'
    });

    // Update notification with appointment link
    await NotificationModel.findByIdAndUpdate(notificationId, {
      appointmentId: appointment._id
    });

    // Update request statistics
    if (request) {
      await RequestModel.findByIdAndUpdate(request._id, {
        $inc: { appointmentsScheduled: 1 }
      });
    }

    return res.status(201).json({
      message: 'Appointment scheduled successfully',
      appointment: {
        id: appointment._id,
        donorName: donor.name,
        scheduledDate: appointment.scheduledDate,
        scheduledTime: appointment.scheduledTime,
        location: appointment.location,
        status: appointment.status
      }
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    return res.status(500).json({ error: 'Failed to create appointment' });
  }
}

// Get appointments for admin
export async function getAppointments(req: Request, res: Response) {
  try {
    const { status, date, bloodGroup, limit = 20, page = 1 } = req.query;
    
    let query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const targetDate = new Date(date as string);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.scheduledDate = { $gte: targetDate, $lt: nextDay };
    }
    
    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    const appointments = await AppointmentModel.find(query)
      .populate('donorId', 'name email phone bloodGroup')
      .populate('requestId', 'bloodGroup unitsRequested urgency hospitalName')
      .sort({ scheduledDate: 1, scheduledTime: 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await AppointmentModel.countDocuments(query);

    return res.json({
      appointments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    return res.status(500).json({ error: 'Failed to fetch appointments' });
  }
}

// Get donor's appointments
export async function getDonorAppointments(req: Request, res: Response) {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find donor
    const donor = await DonorModel.findOne({ userId });
    if (!donor) {
      return res.status(404).json({ error: 'Donor profile not found' });
    }

    const { status, limit = 10, page = 1 } = req.query;
    
    let query: any = { donorId: donor._id };
    if (status) {
      query.status = status;
    }

    const appointments = await AppointmentModel.find(query)
      .populate('requestId', 'bloodGroup unitsRequested urgency hospitalName')
      .sort({ scheduledDate: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await AppointmentModel.countDocuments(query);

    return res.json({
      appointments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get donor appointments error:', error);
    return res.status(500).json({ error: 'Failed to fetch appointments' });
  }
}

// Update appointment status
export async function updateAppointmentStatus(req: Request, res: Response) {
  try {
    const { appointmentId } = req.params;
    const { status, adminNotes, unitsCollected } = req.body;

    if (!['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData: any = { status };
    
    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }
    
    if (status === 'completed') {
      updateData.completedAt = new Date();
      if (unitsCollected) {
        updateData.unitsCollected = unitsCollected;
      }
    }
    
    if (status === 'confirmed') {
      updateData.confirmedAt = new Date();
    }

    const appointment = await AppointmentModel.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true }
    ).populate('donorId', 'name email phone');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    return res.json({
      message: `Appointment ${status}`,
      appointment: {
        id: appointment._id,
        status: appointment.status,
        completedAt: appointment.completedAt,
        unitsCollected: appointment.unitsCollected
      }
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    return res.status(500).json({ error: 'Failed to update appointment status' });
  }
}

// Cancel appointment (donor or admin)
export async function cancelAppointment(req: Request, res: Response) {
  try {
    const { appointmentId } = req.params;
    const { reason } = req.body;
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    const appointment = await AppointmentModel.findById(appointmentId)
      .populate('donorId');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check permissions
    if (userRole === 'donor') {
      const donor = await DonorModel.findOne({ userId });
      if (!donor || appointment.donorId.toString() !== donor._id.toString()) {
        return res.status(403).json({ error: 'You can only cancel your own appointments' });
      }
      
      // Check if appointment can be cancelled (at least 2 hours before)
      const appointmentDateTime = new Date(appointment.scheduledDate);
      const [hours, minutes] = appointment.scheduledTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
      
      const hoursUntilAppointment = (appointmentDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60);
      const canCancel = hoursUntilAppointment > 2 && ['scheduled', 'confirmed'].includes(appointment.status);
      
      if (!canCancel) {
        return res.status(400).json({ 
          error: 'Appointment cannot be cancelled less than 2 hours before scheduled time' 
        });
      }
    }

    // Update appointment
    appointment.status = 'cancelled';
    appointment.cancellationReason = reason;
    await appointment.save();

    return res.json({
      message: 'Appointment cancelled successfully',
      appointment: {
        id: appointment._id,
        status: appointment.status,
        cancellationReason: appointment.cancellationReason
      }
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    return res.status(500).json({ error: 'Failed to cancel appointment' });
  }
}

// Get appointment statistics
export async function getAppointmentStats(req: Request, res: Response) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = await AppointmentModel.aggregate([
      {
        $facet: {
          statusCounts: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          todayAppointments: [
            {
              $match: {
                scheduledDate: { $gte: today, $lt: tomorrow }
              }
            },
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          bloodGroupCounts: [
            { $group: { _id: '$bloodGroup', count: { $sum: 1 } } }
          ],
          completionRate: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                completed: {
                  $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                },
                noShows: {
                  $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] }
                }
              }
            }
          ]
        }
      }
    ]);

    const result = stats[0];
    const completionData = result.completionRate[0] || { total: 0, completed: 0, noShows: 0 };
    
    return res.json({
      statusCounts: result.statusCounts,
      todayAppointments: result.todayAppointments,
      bloodGroupCounts: result.bloodGroupCounts,
      completionRate: completionData.total > 0 ? 
        ((completionData.completed / completionData.total) * 100).toFixed(1) : '0',
      noShowRate: completionData.total > 0 ? 
        ((completionData.noShows / completionData.total) * 100).toFixed(1) : '0',
      totalAppointments: completionData.total
    });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch appointment statistics' });
  }
}
