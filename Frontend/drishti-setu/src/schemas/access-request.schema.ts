// ============================================================
// DRISHTI SETU — Access Request Validation Schema
// ============================================================

import { z } from 'zod';

export const accessRequestSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(150, 'Full name cannot exceed 150 characters'),

  employee_id: z
    .string()
    .min(1, 'Employee ID is required')
    .min(3, 'Employee ID must be at least 3 characters')
    .max(50, 'Employee ID cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9\-_]+$/, 'Employee ID must contain only letters, numbers, hyphens, or underscores')
    .transform((val) => val.trim().toUpperCase()),

  official_email: z
    .string()
    .min(1, 'Official email is required')
    .email('Please enter a valid official email address (e.g. officer@police.gov.in)')
    .max(255, 'Email cannot exceed 255 characters'),

  mobile_number: z
    .string()
    .min(1, 'Mobile number is required')
    .regex(/^(\+91)?[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)'),

  department_id: z
    .number({
      required_error: 'Please select your department',
      invalid_type_error: 'Please select your department',
    })
    .int()
    .positive('Please select your department'),

  designation: z
    .string()
    .min(1, 'Designation is required')
    .min(2, 'Designation must be at least 2 characters')
    .max(100, 'Designation cannot exceed 100 characters'),

  office_unit: z
    .string()
    .min(1, 'Office unit / Police station is required')
    .min(2, 'Office unit must be at least 2 characters')
    .max(150, 'Office unit cannot exceed 150 characters'),

  district: z
    .string()
    .min(1, 'District is required')
    .min(2, 'District must be at least 2 characters')
    .max(100, 'District cannot exceed 100 characters'),

  requested_role: z.enum(['Admin', 'Inspector', 'Viewer'], {
    required_error: 'Please select the requested role',
  }),

  reason: z
    .string()
    .min(1, 'Official reason is required')
    .min(10, 'Please provide an adequate justification (at least 10 characters)')
    .max(1000, 'Justification cannot exceed 1000 characters'),
});

export type AccessRequestFormData = z.infer<typeof accessRequestSchema>;
