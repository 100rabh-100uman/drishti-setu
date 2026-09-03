// ============================================================
// DRISHTI SETU — API Onboarding Validation Schemas
// ============================================================

import { z } from 'zod';

export const apiConnectionSchema = z.object({
  integration_name: z
    .string()
    .min(1, 'Integration Name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be at most 50 characters'),

  department: z
    .string()
    .min(1, 'Source / Department is required'),

  base_url: z
    .string()
    .min(1, 'API Base URL is required')
    .url('Please enter a valid URL (e.g. https://api.surveillance.gov)'),

  api_version: z
    .string()
    .min(1, 'API Version is required')
    .max(10, 'Version string is too long'),

  endpoint: z
    .string()
    .min(1, 'Endpoint is required')
    .regex(/^[a-zA-Z0-9_\-/]+$/, 'Invalid endpoint format (e.g., cameras or v1/nodes)'),
});

export const apiAuthSchema = z.object({
  auth_method: z.enum(['API_KEY', 'BEARER_TOKEN', 'BASIC_AUTH']),
  api_key_header: z.string().optional(),
  api_key_value: z.string().optional(),
  bearer_token: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
}).refine((data) => {
  if (data.auth_method === 'API_KEY') {
    return Boolean(data.api_key_value && data.api_key_value.trim().length > 0);
  }
  if (data.auth_method === 'BEARER_TOKEN') {
    return Boolean(data.bearer_token && data.bearer_token.trim().length > 0);
  }
  if (data.auth_method === 'BASIC_AUTH') {
    return Boolean(data.username && data.username.trim().length > 0 && data.password && data.password.trim().length > 0);
  }
  return true;
}, {
  message: 'Please fill in the required credentials for the selected authentication method',
  path: ['auth_method'],
});

export type ApiConnectionFormData = z.infer<typeof apiConnectionSchema>;
export type ApiAuthFormData = z.infer<typeof apiAuthSchema>;
