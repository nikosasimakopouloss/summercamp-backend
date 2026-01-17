import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user.model';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || '';

declare global {
  namespace Express {
    interface Request { user?: any }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: 'Missing or invalid Authorization Header' });
  }

  const token = header.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Invalid Authorization Format' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const user = await User.findById(req.user.userId).populate('roles');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const isAdmin = user.roles.some((role: any) =>
      role.role === 'ADMIN' || role.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = user.toObject();
    delete req.user.password;

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};