import { AuthSession, Department, User } from "@/types/auth";
import { authService as realAuthService } from "@/services/auth.service";
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
    return MOCK_USERS.filter((u) => String(u.departmentId) === String(departmentId));
  },

  login: async (employeeId: string, password: string): Promise<AuthSession> => {
    return realAuthService.login(employeeId, password);
  },

  getCurrentSession: (): AuthSession | null => {
    return realAuthService.getCurrentSession();
  },

  validateSession: async (): Promise<AuthSession | null> => {
    return realAuthService.validateSession();
  },

  logout: (): void => {
    realAuthService.logout();
  }
};

export default authService;
