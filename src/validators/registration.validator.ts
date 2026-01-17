import { z } from 'zod';

// Body validators
export const createRegistrationSchema = z.object({
  campType: z.enum(['Η Φωλιά του Παιδιού', 'Ο Παράδεισος του Παιδιού']),
  campPeriod: z.enum([
    'A\' (16/6 - 30/6)',
    'B\' (17/7 - 15/7)',
    'Γ\' (16/7 - 30/7)',
    'Δ\' (31/7 - 14/8) Μόνο για την Φωλιά',
    'E\' (17/8 - 31/8) Μόνο για την Φωλιά'
  ]),
  camper: z.string()
    .min(1, 'Camper ID is required'),
  beneficiary: z.enum(['Μητέρα', 'Πατέρας']),
  motherName: z.string()
    .min(3, 'Mother name must be at least 3 characters')
    .max(100, 'Mother name cannot exceed 100 characters'),
  fatherName: z.string()
    .min(3, 'Father name must be at least 3 characters')
    .max(100, 'Father name cannot exceed 100 characters'),
  socialSecurityFund: z.string()
    .max(50, 'Social security fund cannot exceed 50 characters')
    .optional(),
  notes: z.string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional(),
  user: z.string().optional()
});

export const updateRegistrationSchema = createRegistrationSchema.partial();

// Search by AMKA (body - POST request)
export const searchAmkaSchema = z.object({
  amka: z.string().regex(/^\d{11}$/, 'AMKA must be exactly 11 digits'),
  type: z.enum(['parent', 'camper'])
});

// Query parameters for admin listing (GET request)
export const registrationQuerySchema = z.object({
  amka: z.string().regex(/^\d{11}$/, 'AMKA must be exactly 11 digits').optional(),
  type: z.enum(['parent', 'camper']).optional(),
  campType: z.enum(['Η Φωλιά του Παιδιού', 'Ο Παράδεισος του Παιδιού']).optional(),
  campPeriod: z.enum([
    'A\' (16/6 - 30/6)',
    'B\' (17/7 - 15/7)',
    'Γ\' (16/7 - 30/7)',
    'Δ\' (31/7 - 14/8) Μόνο για την Φωλιά',
    'E\' (17/8 - 31/8) Μόνο για την Φωλιά'
  ]).optional(),
  isActive: z.enum(['true', 'false']).optional()
});