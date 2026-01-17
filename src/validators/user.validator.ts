import { z } from 'zod';

export const phoneSchema = z.object({
  type: z.string(),
  number: z.string()
});

export const addressSchema = z.object({
  area: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  po: z.string().optional(),
  municipality: z.string().optional()
});

export const createUserSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters'),
  password: z.string()
    .min(5, 'Password must be at least 5 characters'),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  amka: z.string()
    .regex(/^\d{11}$/, 'AMKA must be exactly 11 digits'),
  email: z.string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  address: addressSchema.optional(),
  phone: z.array(phoneSchema).optional(),
  roles: z.array(z.string()).optional().default([])
});

export const updateUserSchema = createUserSchema.partial();

// AMKA validation for both body (POST) and query (GET)
export const checkAmkaSchema = z.object({
  amka: z.string().regex(/^\d{11}$/, 'AMKA must be exactly 11 digits')
});