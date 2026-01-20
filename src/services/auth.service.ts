import User from '../models/user.model';
import { AuthPayload } from '../models/auth.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || '';

export const login = async (username: string, password: string) => {
  const user = await User.findOne({ username }).populate('roles');
  if (!user) return null;

  const match = await bcrypt.compare(password, user.password);
  if (!match) return null;

  const payload: AuthPayload = {
    userId: user._id,
    username: user.username,
    email: user.email || '',
    roles: user.roles.map(role => role._id)
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

  const userWithoutPassword = user.toObject();
  //  delete userWithoutPassword.password;

  return { user: userWithoutPassword, token };
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (error) {
    return null;
  }
};