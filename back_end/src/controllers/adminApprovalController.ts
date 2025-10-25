import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import mongoose from 'mongoose';

// Get pending admin registrations (main admin only)
export async function getPendingAdmins(req: Request, res: Response) {
  try {
    const userId = req.user?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is main admin
    const currentUser = await UserModel.findById(userId);
    if (!currentUser || !currentUser.isMainAdmin) {
      return res.status(403).json({ error: 'Only main admin can access this feature' });
    }

    // Get pending admin registrations
    const pendingAdmins = await UserModel.find({
      role: 'admin',
      adminStatus: 'pending',
      isMainAdmin: { $ne: true } // Exclude main admin
    }).select('-passwordHash').sort({ createdAt: -1 });

    return res.json(pendingAdmins);

  } catch (error) {
    console.error('Get pending admins error:', error);
    return res.status(500).json({ error: 'Failed to fetch pending admins' });
  }
}

// Approve admin registration (main admin only)
export async function approveAdmin(req: Request, res: Response) {
  try {
    const { adminId } = req.params;
    const userId = req.user?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is main admin
    const currentUser = await UserModel.findById(userId);
    if (!currentUser || !currentUser.isMainAdmin) {
      return res.status(403).json({ error: 'Only main admin can approve admins' });
    }

    // Find the admin to approve
    const adminToApprove = await UserModel.findById(adminId);
    if (!adminToApprove) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    if (adminToApprove.role !== 'admin') {
      return res.status(400).json({ error: 'User is not an admin' });
    }

    if (adminToApprove.adminStatus === 'approved') {
      return res.status(400).json({ error: 'Admin is already approved' });
    }

    // Approve the admin
    adminToApprove.adminStatus = 'approved';
    adminToApprove.approvedBy = new mongoose.Types.ObjectId(userId);
    adminToApprove.approvedAt = new Date();
    
    await adminToApprove.save();

    return res.json({
      message: 'Admin approved successfully',
      admin: {
        id: adminToApprove._id,
        name: adminToApprove.name,
        email: adminToApprove.email,
        status: adminToApprove.adminStatus,
        approvedAt: adminToApprove.approvedAt
      }
    });

  } catch (error) {
    console.error('Approve admin error:', error);
    return res.status(500).json({ error: 'Failed to approve admin' });
  }
}

// Reject admin registration (main admin only)
export async function rejectAdmin(req: Request, res: Response) {
  try {
    const { adminId } = req.params;
    const { reason } = req.body;
    const userId = req.user?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is main admin
    const currentUser = await UserModel.findById(userId);
    if (!currentUser || !currentUser.isMainAdmin) {
      return res.status(403).json({ error: 'Only main admin can reject admins' });
    }

    // Find the admin to reject
    const adminToReject = await UserModel.findById(adminId);
    if (!adminToReject) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    if (adminToReject.role !== 'admin') {
      return res.status(400).json({ error: 'User is not an admin' });
    }

    // Reject the admin (or delete the account)
    adminToReject.adminStatus = 'rejected';
    adminToReject.approvedBy = new mongoose.Types.ObjectId(userId);
    adminToReject.approvedAt = new Date();
    
    await adminToReject.save();

    return res.json({
      message: 'Admin rejected successfully',
      admin: {
        id: adminToReject._id,
        name: adminToReject.name,
        email: adminToReject.email,
        status: adminToReject.adminStatus,
        reason: reason || 'No reason provided'
      }
    });

  } catch (error) {
    console.error('Reject admin error:', error);
    return res.status(500).json({ error: 'Failed to reject admin' });
  }
}

// Check if current user is main admin
export async function checkMainAdminStatus(req: Request, res: Response) {
  try {
    const userId = req.user?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await UserModel.findById(userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      isMainAdmin: user.isMainAdmin || false,
      adminStatus: user.adminStatus,
      canApproveAdmins: user.isMainAdmin || false
    });

  } catch (error) {
    console.error('Check main admin status error:', error);
    return res.status(500).json({ error: 'Failed to check admin status' });
  }
}

// Get admin statistics (main admin only)
export async function getAdminStats(req: Request, res: Response) {
  try {
    const userId = req.user?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is main admin
    const currentUser = await UserModel.findById(userId);
    if (!currentUser || !currentUser.isMainAdmin) {
      return res.status(403).json({ error: 'Only main admin can access admin statistics' });
    }

    const stats = await UserModel.aggregate([
      {
        $match: { role: 'admin' }
      },
      {
        $group: {
          _id: '$adminStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalAdmins = await UserModel.countDocuments({ role: 'admin' });
    const mainAdmins = await UserModel.countDocuments({ role: 'admin', isMainAdmin: true });

    const statsObj = stats.reduce((acc: any, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    const activeAdmins = await UserModel.countDocuments({ role: 'admin', isActive: true });
    const disabledAdmins = await UserModel.countDocuments({ role: 'admin', isActive: false });

    return res.json({
      totalAdmins,
      mainAdmins,
      pendingAdmins: statsObj.pending || 0,
      approvedAdmins: statsObj.approved || 0,
      rejectedAdmins: statsObj.rejected || 0,
      activeAdmins,
      disabledAdmins
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    return res.status(500).json({ error: 'Failed to get admin statistics' });
  }
}

// Get all admins (main admin only)
export async function getAllAdmins(req: Request, res: Response) {
  try {
    const userId = req.user?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is main admin
    const currentUser = await UserModel.findById(userId);
    if (!currentUser || !currentUser.isMainAdmin) {
      return res.status(403).json({ error: 'Only main admin can access this feature' });
    }

    // Get all admin users
    const admins = await UserModel.find({
      role: 'admin'
    })
    .select('-passwordHash')
    .sort({ createdAt: -1 });

    return res.json(admins);

  } catch (error) {
    console.error('Get all admins error:', error);
    return res.status(500).json({ error: 'Failed to fetch admins' });
  }
}

// Toggle admin active status (main admin only)
export async function toggleAdminStatus(req: Request, res: Response) {
  try {
    const { adminId } = req.params;
    const { isActive } = req.body;
    const userId = req.user?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is main admin
    const currentUser = await UserModel.findById(userId);
    if (!currentUser || !currentUser.isMainAdmin) {
      return res.status(403).json({ error: 'Only main admin can manage admin status' });
    }

    // Find the admin to update
    const adminToUpdate = await UserModel.findById(adminId);
    if (!adminToUpdate) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Cannot disable main admin
    if (adminToUpdate.isMainAdmin) {
      return res.status(400).json({ error: 'Cannot disable main admin' });
    }

    if (adminToUpdate.role !== 'admin') {
      return res.status(400).json({ error: 'User is not an admin' });
    }

    // Update status
    adminToUpdate.isActive = isActive;
    await adminToUpdate.save();

    return res.json({
      message: `Admin ${isActive ? 'enabled' : 'disabled'} successfully`,
      admin: {
        id: adminToUpdate._id,
        name: adminToUpdate.name,
        email: adminToUpdate.email,
        isActive: adminToUpdate.isActive
      }
    });

  } catch (error) {
    console.error('Toggle admin status error:', error);
    return res.status(500).json({ error: 'Failed to update admin status' });
  }
}

// Delete admin (main admin only)
export async function deleteAdmin(req: Request, res: Response) {
  try {
    const { adminId } = req.params;
    const userId = req.user?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is main admin
    const currentUser = await UserModel.findById(userId);
    if (!currentUser || !currentUser.isMainAdmin) {
      return res.status(403).json({ error: 'Only main admin can delete admins' });
    }

    // Find the admin to delete
    const adminToDelete = await UserModel.findById(adminId);
    if (!adminToDelete) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Cannot delete main admin
    if (adminToDelete.isMainAdmin) {
      return res.status(400).json({ error: 'Cannot delete main admin' });
    }

    if (adminToDelete.role !== 'admin') {
      return res.status(400).json({ error: 'User is not an admin' });
    }

    // Delete the admin
    await UserModel.findByIdAndDelete(adminId);

    return res.json({
      message: 'Admin deleted successfully',
      admin: {
        id: adminToDelete._id,
        name: adminToDelete.name,
        email: adminToDelete.email
      }
    });

  } catch (error) {
    console.error('Delete admin error:', error);
    return res.status(500).json({ error: 'Failed to delete admin' });
  }
}
