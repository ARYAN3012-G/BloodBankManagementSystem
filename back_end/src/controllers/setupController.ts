import { Request, Response } from 'express';
import { UserModel } from '../models/User';

// Setup main admin - temporary endpoint for initial setup
export async function setupMainAdmin(req: Request, res: Response) {
  try {
    const mainAdminEmail = 'aryanrajeshgadam17@gmail.com';
    
    // Find the user
    const user = await UserModel.findOne({ email: mainAdminEmail });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'Please register with the email aryanrajeshgadam17@gmail.com first'
      });
    }

    // Update user to be main admin
    user.isMainAdmin = true;
    user.adminStatus = 'approved';
    user.approvedAt = new Date();
    
    await user.save();

    return res.json({
      message: 'Main admin setup successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isMainAdmin: user.isMainAdmin,
        adminStatus: user.adminStatus
      }
    });

  } catch (error) {
    console.error('Setup main admin error:', error);
    return res.status(500).json({ error: 'Failed to setup main admin' });
  }
}
