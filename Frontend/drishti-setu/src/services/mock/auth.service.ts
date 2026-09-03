import { AuthSession, Department, User } from "@/types/auth";
import { MOCK_DEPARTMENTS, MOCK_USERS } from "./mock-data";

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  getDepartments: async (): Promise<Department[]> => {
    await delay(300);
    return MOCK_DEPARTMENTS;
  },

  getUsersByDepartment: async (departmentId: string): Promise<User[]> => {
    await delay(300);
    return MOCK_USERS.filter((u) => u.departmentId === departmentId);
  },

  login: async (employeeId: string, password: string): Promise<AuthSession> => {
    await delay(1200); // Simulate realistic auth delay
    
    // For demo purposes, any password "password123" works.
    // Employee ID must match a mock user.
    const user = MOCK_USERS.find((u) => u.employeeId === employeeId);
    
    if (!user || password !== "password123") {
      throw new Error("Invalid credentials. Please try again.");
    }

    const department = MOCK_DEPARTMENTS.find((d) => d.id === user.departmentId);
    
    if (!department) {
      throw new Error("Department configuration error.");
    }

    // Mock permissions based on role
    const permissions = user.role === "SUPER_ADMIN" 
      ? ["all"] 
      : ["view_dashboard", "view_cameras"];

    const session = {
      user,
      department,
      permissions,
      token: "mock_jwt_token_12345",
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('drishti_auth_session', JSON.stringify(session));
    }
    
    return session;
  },

  getCurrentSession: (): AuthSession | null => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('drishti_auth_session');
      if (stored) return JSON.parse(stored);
    }
    return null;
  }
};
