// ============================================================
// DRISHTI SETU — Database-Backed Authentication Service
// ============================================================
// Communicates with FastAPI backend using centralized apiClient.
// Single source of truth: PostgreSQL users & roles tables.
// ============================================================

import { apiClient, API_ENDPOINTS, setAuthToken, getAuthToken, ApiError } from '@/services/api';
import { AuthSession, Department, LoginResponse, User, UserProfileResponse } from '@/types/auth';

const SESSION_STORAGE_KEY = 'drishti_auth_session';
const COOKIE_NAME = 'drishti_auth_token';

function setAuthCookie(token: string, maxAgeSeconds: number = 86400): void {
  if (typeof document !== 'undefined') {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
  }
}

function clearAuthCookie(): void {
  if (typeof document !== 'undefined') {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}

class AuthService {
  /**
   * Authenticates against FastAPI backend POST /users/login/
   * Returns enriched user session with real role and department from Supabase.
   */
  async login(employeeId: string, password: string): Promise<AuthSession> {
    const trimmedEmployeeId = employeeId.trim();

    if (!trimmedEmployeeId || !password) {
      throw new Error('Please provide both Employee ID and password.');
    }

    const res = await apiClient.post<LoginResponse>(API_ENDPOINTS.USERS.LOGIN, {
      employee_id: trimmedEmployeeId,
      password: password,
    });

    const userRaw = res.user || res;

    const user: User = {
      id: userRaw.id,
      employee_id: userRaw.employee_id,
      username: userRaw.username,
      department_id: userRaw.department_id,
      department_name: userRaw.department_name,
      role: userRaw.role || 'Viewer',
      // Compatibility aliases
      name: userRaw.username,
      employeeId: userRaw.employee_id,
      departmentId: userRaw.department_id,
    };

    const department: Department = {
      id: user.department_id ?? 1,
      name: user.department_name || 'Gujarat Police',
    };

    const session: AuthSession = {
      user,
      department,
      token: res.access_token,
      token_type: res.token_type || 'bearer',
      permissions: user.role === 'Admin' ? ['all'] : ['view_dashboard', 'view_cameras'],
    };

    // Store token in apiClient memory and localStorage
    setAuthToken(res.access_token);
    setAuthCookie(res.access_token);

    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }

    return session;
  }

  /**
   * Retrieves the current authenticated session from browser storage.
   */
  getCurrentSession(): AuthSession | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Verifies the active JWT token against the real backend GET /users/me/
   * Refreshes the local session state if the token is valid.
   * If invalid, clears the session and returns null.
   */
  async validateSession(): Promise<AuthSession | null> {
    const token = getAuthToken();
    if (!token) {
      this.logout();
      return null;
    }

    try {
      const profile = await apiClient.get<UserProfileResponse>(API_ENDPOINTS.USERS.ME);

      const user: User = {
        id: profile.id,
        employee_id: profile.employee_id,
        username: profile.username,
        department_id: profile.department_id,
        department_name: profile.department_name,
        role: profile.role || 'Viewer',
        created_at: profile.created_at,
        // Compatibility aliases
        name: profile.username,
        employeeId: profile.employee_id,
        departmentId: profile.department_id,
      };

      const department: Department = {
        id: user.department_id ?? 1,
        name: user.department_name || 'Gujarat Police',
      };

      const existingSession = this.getCurrentSession();
      const updatedSession: AuthSession = {
        user,
        department,
        token,
        token_type: existingSession?.token_type || 'bearer',
        permissions: user.role === 'Admin' ? ['all'] : ['view_dashboard', 'view_cameras'],
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedSession));
      }

      return updatedSession;
    } catch (err: unknown) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
        // Token expired or user deleted
        this.logout();
        return null;
      }
      // If network temporarily unavailable but we have a valid cached session, allow transient offline
      const cached = this.getCurrentSession();
      if (cached) return cached;

      this.logout();
      return null;
    }
  }

  /**
   * Clears token and session storage, terminating active authentication.
   */
  logout(): void {
    setAuthToken(null);
    clearAuthCookie();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem('drishti_auth_token');
    }
  }
}

export const authService = new AuthService();
export default authService;
