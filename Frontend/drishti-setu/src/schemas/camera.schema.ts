// ============================================================
// DRISHTI SETU — Camera Zod Validation Schemas
// ============================================================

import { z } from 'zod';

// ── Step 1: Camera Identity ──────────────────────────────────
export const cameraIdentitySchema = z.object({
  camera_id: z
    .string()
    .min(1, 'Camera ID is required')
    .min(3, 'Camera ID must be at least 3 characters')
    .max(30, 'Camera ID must be at most 30 characters')
    .regex(/^[A-Za-z0-9\-_]+$/, 'Camera ID can only contain letters, numbers, hyphens, and underscores'),

  serial_number: z
    .string()
    .min(1, 'Serial Number is required')
    .min(5, 'Serial Number must be at least 5 characters')
    .max(50, 'Serial Number must be at most 50 characters'),

  device_uuid: z
    .string()
    .min(1, 'Device UUID is required')
    .regex(
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
      'Invalid UUID format (e.g., 550e8400-e29b-41d4-a716-446655440000)'
    ),
});

// ── Step 2: Department & Location ────────────────────────────
export const departmentLocationSchema = z.object({
  department: z
    .string()
    .min(1, 'Department is required'),

  zone: z
    .string()
    .min(1, 'Zone is required'),

  address: z
    .string()
    .min(1, 'Address is required')
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address must be at most 500 characters'),

  latitude: z
    .string()
    .min(1, 'Latitude is required')
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= -90 && num <= 90;
      },
      'Latitude must be between -90 and 90'
    ),

  longitude: z
    .string()
    .min(1, 'Longitude is required')
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= -180 && num <= 180;
      },
      'Longitude must be between -180 and 180'
    ),
});

// ── Step 3: Camera & Network ─────────────────────────────────
export const cameraNetworkSchema = z.object({
  camera_type: z
    .enum(['IP', 'Analog'], {
      errorMap: () => ({ message: 'Please select a camera type' }),
    }),

  mac_address: z
    .string()
    .min(1, 'MAC Address is required')
    .regex(
      /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/,
      'Invalid MAC format (e.g., 00:1A:2B:3C:4D:5E)'
    ),

  ip_address: z
    .string()
    .min(1, 'IP Address is required')
    .regex(
      /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
      'Invalid IPv4 format (e.g., 192.168.1.10)'
    ),
});

// ── Step 4: Status ───────────────────────────────────────────
export const cameraStatusSchema = z.object({
  status: z
    .enum(['Active', 'Inactive', 'Maintenance', 'Offline'], {
      errorMap: () => ({ message: 'Please select a status' }),
    }),

  needs_review: z.boolean(),
});

// ── Full Schema (all steps combined) ─────────────────────────
export const cameraFormSchema = cameraIdentitySchema
  .merge(departmentLocationSchema)
  .merge(cameraNetworkSchema)
  .merge(cameraStatusSchema);

export type CameraIdentityData = z.infer<typeof cameraIdentitySchema>;
export type DepartmentLocationData = z.infer<typeof departmentLocationSchema>;
export type CameraNetworkData = z.infer<typeof cameraNetworkSchema>;
export type CameraStatusData = z.infer<typeof cameraStatusSchema>;
export type CameraFormSchemaData = z.infer<typeof cameraFormSchema>;

// Step schemas array for indexed access in the hook
export const STEP_SCHEMAS = [
  cameraIdentitySchema,
  departmentLocationSchema,
  cameraNetworkSchema,
  cameraStatusSchema,
  null, // Step 5 (Review) has no additional validation
] as const;
