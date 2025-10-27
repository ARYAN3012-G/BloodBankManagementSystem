import { Request, Response } from 'express';
import { RequestModel } from '../models/Request';
import { NotificationModel } from '../models/Notification';
import { AppointmentModel } from '../models/Appointment';

// Get all proactive requests with their details for cleanup
export async function getProactiveRequestsForCleanup(req: Request, res: Response) {
  try {
    const requests = await RequestModel.find({ 
      type: 'proactive_inventory' 
    }).sort({ createdAt: -1 });

    // Enrich with notification and appointment counts
    const enriched = await Promise.all(requests.map(async (request) => {
      const notifications = await NotificationModel.countDocuments({ requestId: request._id });
      const appointments = await AppointmentModel.countDocuments({ requestId: request._id });
      
      return {
        _id: request._id,
        bloodGroup: request.bloodGroup,
        unitsRequested: request.unitsRequested,
        unitsCollected: request.unitsCollected || 0,
        status: request.status,
        donorsNotified: request.donorsNotified || 0,
        appointmentsScheduled: request.appointmentsScheduled || 0,
        createdAt: request.createdAt,
        notificationsCount: notifications,
        appointmentsCount: appointments,
        hasData: notifications > 0 || appointments > 0
      };
    }));

    return res.json({ requests: enriched });
  } catch (error) {
    console.error('Get proactive requests error:', error);
    return res.status(500).json({ error: 'Failed to get requests' });
  }
}

// Delete a specific proactive request (and its related data)
export async function deleteProactiveRequest(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { deleteRelatedData } = req.body;

    const request = await RequestModel.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Delete related data if requested
    if (deleteRelatedData) {
      await NotificationModel.deleteMany({ requestId: id });
      await AppointmentModel.deleteMany({ requestId: id });
    }

    // Delete the request
    await RequestModel.findByIdAndDelete(id);

    return res.json({ 
      message: 'Request deleted successfully',
      deletedRelatedData: deleteRelatedData 
    });
  } catch (error) {
    console.error('Delete proactive request error:', error);
    return res.status(500).json({ error: 'Failed to delete request' });
  }
}
