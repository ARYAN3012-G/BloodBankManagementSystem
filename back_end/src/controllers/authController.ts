import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, UserRole } from '../models/User';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, role, name, phone } = req.body as {
      email: string; password: string; role: UserRole; name: string; phone?: string;
    };

    if (!email || !password || !role || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await UserModel.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user with admin approval logic
    const userData: any = { 
      email, 
      passwordHash, 
      role, 
      name, 
      phone 
    };

    // Set admin status for new admin registrations
    if (role === 'admin') {
      // Check if this is the main admin email
      if (email === 'aryanrajeshgadam17@gmail.com') {
        userData.isMainAdmin = true;
        userData.adminStatus = 'approved';
        userData.approvedAt = new Date();
        userData.isActive = true;
      } else {
        userData.adminStatus = 'pending'; // New admins need approval
        userData.isActive = true; // Default to active but pending approval
      }
    }

    const user = await UserModel.create(userData);

    // Return appropriate message based on admin status
    if (role === 'admin' && !user.isMainAdmin) {
      return res.status(201).json({ 
        id: user._id, 
        email: user.email, 
        role: user.role, 
        name: user.name,
        message: 'Admin registration submitted. Awaiting approval from main administrator.',
        adminStatus: 'pending'
      });
    }

    return res.status(201).json({ 
      id: user._id, 
      email: user.email, 
      role: user.role, 
      name: user.name,
      adminStatus: user.adminStatus 
    });
  } catch (err) {
    return res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // Check if account is active (for all roles)
    if (user.isActive === false) {
      return res.status(403).json({ 
        error: 'Account disabled',
        message: 'Your account has been disabled. Please contact support.'
      });
    }

    // Check admin approval status
    if (user.role === 'admin' && user.adminStatus === 'pending') {
      return res.status(403).json({ 
        error: 'Admin account pending approval',
        message: 'Your admin registration is awaiting approval from the main administrator. Please contact support.'
      });
    }

    if (user.role === 'admin' && user.adminStatus === 'rejected') {
      return res.status(403).json({ 
        error: 'Admin account rejected',
        message: 'Your admin registration has been rejected. Please contact support.'
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'Server misconfigured' });
    
    const token = jwt.sign(
      {
        sub: user._id.toString(),
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isMainAdmin: user.isMainAdmin || false
      },
      secret,
      { expiresIn: '7d' }
    );
    
    return res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role, 
        name: user.name,
        isMainAdmin: user.isMainAdmin || false,
        adminStatus: user.adminStatus
      } 
    });
  } catch (err) {
    return res.status(500).json({ error: 'Login failed' });
  }
}


