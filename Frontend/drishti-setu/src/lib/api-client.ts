// ============================================================
// DRISHTI SETU — Centralized API Client Layer
// ============================================================
// Configured with Axios to communicate with the FastAPI backend.
// Reads backend URL from NEXT_PUBLIC_API_URL.
// Centralizes Bearer token injection and error formatting.
// ============================================================

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

// ── Environment Configuration ────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

// ── Token Storage Keys ────────────────────────────────────────
const AUTH_TOKEN_KEY = 'drishti_auth_token';
const AUTH_SESSION_KEY = 'drishti_auth_session';

// In-memory token fallback (useful during SSR or runtime overrides)
let memoryToken: string | null = null;

/**
 * Retrieve the current authentication token from memory or browser storage.
 */
export function getAuthToken(): string | null {
  if (memoryToken) {
    return memoryToken;
  }

  if (typeof window !== 'undefined') {
    // Check direct token key first
    const directToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (directToken) return directToken;

    // Check auth session object
    const sessionStr = localStorage.getItem(AUTH_SESSION_KEY);
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session && typeof session.token === 'string' && session.token.trim()) {
          return session.token;
        }
      } catch {
        // Ignore parse error
      }
    }
  }

  return null;
}

/**
 * Explicitly set or clear the authentication token in memory and storage.
 */
export function setAuthToken(token: string | null): void {
  memoryToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }
}

// ── Strongly-Typed API Error ─────────────────────────────────

export interface ApiErrorDetails {
  message: string;
  status: number;
  code?: string;
  data?: unknown;
  isNetworkError: boolean;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly data?: unknown;
  readonly isNetworkError: boolean;

  constructor(details: ApiErrorDetails) {
    super(details.message);
    this.name = 'ApiError';
    this.status = details.status;
    this.code = details.code;
    this.data = details.data;
    this.isNetworkError = details.isNetworkError;

    // Maintain prototype chain
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Type guard to check if an unknown caught error is an ApiError.
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Extract a human-readable error message from backend error responses.
 * Handles FastAPI default schemas: { detail: string | array }, { error: string }, { message: string }.
 */
function extractErrorMessage(error: AxiosError): string {
  if (error.response?.data) {
    const data = error.response.data as Record<string, unknown>;

    // FastAPI HTTPException { detail: "..." } or validation errors { detail: [{ msg: "..." }] }
    if (data.detail) {
      if (typeof data.detail === 'string') {
        return data.detail;
      }
      if (Array.isArray(data.detail)) {
        return data.detail
          .map((item: { msg?: string; loc?: string[] }) => {
            const field = item.loc ? item.loc.slice(-1)[0] : '';
            return field ? `${field}: ${item.msg || 'Invalid'}` : item.msg || 'Validation error';
          })
          .join('; ');
      }
    }

    // Generic backend error messages { message: "..." } or { error: "..." }
    if (typeof data.message === 'string') return data.message;
    if (typeof data.error === 'string') return data.error;
  }

  // Network or timeout errors
  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Please verify your connection to the DRISHTI SETU server.';
  }
  if (!error.response && error.request) {
    return 'Unable to reach the DRISHTI SETU backend service. Please check your network connection.';
  }

  return error.message || 'An unexpected error occurred while communicating with the server.';
}

// ── Axios Instance Creation & Interceptors ───────────────────

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach Bearer token if present
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Transform non-2xx responses into ApiError
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const message = extractErrorMessage(error);
    const status = error.response?.status || 0;
    const isNetworkError = !error.response && Boolean(error.request);

    const apiError = new ApiError({
      message,
      status,
      code: error.code,
      data: error.response?.data,
      isNetworkError,
    });

    return Promise.reject(apiError);
  }
);

// ── Typed API Client Facade ──────────────────────────────────

export const apiClient = {
  /**
   * Underlying Axios instance for advanced custom requests
   */
  raw: axiosInstance,

  /**
   * HTTP GET
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.get<T>(url, config);
    return response.data;
  },

  /**
   * HTTP POST
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.post<T>(url, data, config);
    return response.data;
  },

  /**
   * HTTP PUT
   */
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.put<T>(url, data, config);
    return response.data;
  },

  /**
   * HTTP PATCH
   */
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.patch<T>(url, data, config);
    return response.data;
  },

  /**
   * HTTP DELETE
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.delete<T>(url, config);
    return response.data;
  },
};

export default apiClient;
