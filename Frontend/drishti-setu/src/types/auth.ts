// ============================================================
// DRISHTI SETU — Database-Backed Authentication Types
// ============================================================
// Source of truth: PostgreSQL users, roles, and departments tables
// ============================================================

export type UserRole = 'Admin' | 'Inspector' | 'Viewer' | string;

export interface Department {
  id: string | number;
  name: string;
  code?: string;
  accessScope?: 'STATE_LEVEL' | 'DISTRICT' | 'LOCAL' | 'DEPARTMENTAL';
}

export interface User {
  id: string | number;
  employee_id?: string;
  username?: string;
  department_id?: number | string;
  department_name?: string;
  role: UserRole;
  created_at?: string;

  // Compatibility aliases
  name?: string;
  employeeId?: string;
  departmentId?: string | number;
}

export interface AuthUser extends User {
  employee_id: string;
  username: string;
  department_id: number;
}

export interface AuthSession {
  user: User;
  token: string;
  token_type?: string;
  department?: Department;
  permissions?: string[];
}

export interface LoginRequest {
  employee_id: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  id: number;
  employee_id: string;
  username: string;
  department_id: number;
  department_name: string;
  role: string;
  user: {
    id: number;
    employee_id: string;
    username: string;
    department_id: number;
    department_name: string;
    role: string;
  };
}

export interface UserProfileResponse {
  id: number;
  employee_id: string;
  username: string;
  department_id: number;
  department_name: string;
  role: string;
  created_at?: string;
}
