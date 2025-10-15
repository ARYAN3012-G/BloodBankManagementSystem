import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { DonorModel } from '../models/Donor';
import bcrypt from 'bcryptjs';

// Admin creates donor with complete user account
export async function adminCreateDonor(req: Request, res: Response) {
  try {
    const {
      name,
      email,
      phone,
      dateOfBirth,
      bloodGroup,
      address,
      emergencyContact,
      donorType,
      availability,
      notificationPreferences,
      weight,
      height,
      medicalConditions,
      medications,
      // Admin sets temporary password
      temporaryPassword = 'TempPass123!'
    } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }

    // Create User account first
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: 'donor',
      phone,
      isEmailVerified: true, // Admin verified
      mustChangePassword: true // Force password change on first login
    });

    // Create Donor profile linked to user
    const donor = await DonorModel.create({
      userId: user._id, // Link to user account
      name,
      email,
      phone,
      dateOfBirth: new Date(dateOfBirth),
      bloodGroup,
      address,
      emergencyContact,
      donorType: donorType || 'regular',
      availability: availability || {
        weekdays: true,
        weekends: false,
        evenings: true,
        mornings: false
      },
      notificationPreferences: notificationPreferences || {
        email: true,
        sms: true,
        phone: false
      },
      weight,
      height,
      medicalConditions,
      medications,
      registeredBy: req.user?.sub, // Admin who created this
      verificationStatus: 'verified', // Admin verified
      status: 'active'
    });

    return res.status(201).json({
      message: 'Donor created successfully',
      donor: {
        id: donor._id,
        name: donor.name,
        email: donor.email,
        bloodGroup: donor.bloodGroup,
        temporaryPassword, // Send to admin to give to donor
        loginInstructions: 'Donor must change password on first login'
      }
    });

  } catch (error) {
    console.error('Admin create donor error:', error);
    return res.status(500).json({ error: 'Failed to create donor' });
  }
}

// Send login credentials to donor
export async function sendDonorCredentials(req: Request, res: Response) {
  try {
    const { donorId } = req.params;
    
    const donor = await DonorModel.findById(donorId);
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    // Here you would integrate with email service
    // For now, just return the credentials
    return res.json({
      message: 'Credentials prepared for donor',
      credentials: {
        email: donor.email,
        temporaryPassword: 'TempPass123!',
        loginUrl: `${process.env.FRONTEND_URL}/login`,
        instructions: 'Please log in and change your password immediately'
      }
    });

  } catch (error) {
    console.error('Send credentials error:', error);
    return res.status(500).json({ error: 'Failed to send credentials' });
  }
}
