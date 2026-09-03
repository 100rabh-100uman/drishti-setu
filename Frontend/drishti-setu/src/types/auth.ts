export interface Department {
  id: string;
  code: string;
  name: string;
  accessScope: "STATE_LEVEL" | "DISTRICT" | "LOCAL" | "DEPARTMENTAL";
}

export interface User {
  id: string;
  employeeId: string;
  name: string;
  departmentId: string;
  role: string;
}

export interface AuthSession {
  user: User;
  department: Department;
  permissions: string[];
  token: string;
}
