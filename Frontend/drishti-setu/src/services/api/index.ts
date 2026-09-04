// ============================================================
// DRISHTI SETU — API Service Layer Entry Point
// ============================================================
// Re-exports the centralized Axios client, endpoint definitions,
// and typed error utilities for all domain services.
// ============================================================

export {
  apiClient,
  ApiError,
  isApiError,
  getAuthToken,
  setAuthToken,
} from '@/lib/api-client';

export type { ApiErrorDetails } from '@/lib/api-client';
export { API_ENDPOINTS } from './endpoints';
