import { z } from 'zod';

export const createCamperSchema = z.object({
  fullName: z.string()
    .min(3, 'Full name must be at least 3 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  dateOfBirth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  amka: z.string()
    .regex(/^\d{11}$/, 'AMKA must be exactly 11 digits'),
  visitorType: z.enum(['Παλιός κατασκηνωτής', 'Νέος κατασκηνωτής']),
  additionalInfo: z.string()
    .max(500, 'Additional info cannot exceed 500 characters')
    .optional(),
  healthDeclarationAccepted: z.literal(true, {
     message: 'Health declaration must be accepted' 
  }),
  parent: z.string().optional()
});

export const updateCamperSchema = createCamperSchema.partial();

export const checkCamperAmkaSchema = z.object({
  amka: z.string().regex(/^\d{11}$/, 'AMKA must be exactly 11 digits')
});