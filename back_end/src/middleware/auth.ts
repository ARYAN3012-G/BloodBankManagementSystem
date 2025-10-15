import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  sub: string; // user id
  role: 'admin' | 'hospital' | 'donor' | 'external';
  name?: string;
  email?: string;
  phone?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function requireAuth(roles?: AuthPayload['role'][]): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring('Bearer '.length)
      : req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error('JWT_SECRET not configured');
      const payload = jwt.verify(token, secret) as AuthPayload;
      if (roles && !roles.includes(payload.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      req.user = payload;
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}


