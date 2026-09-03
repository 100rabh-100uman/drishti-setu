import { Department, User } from "@/types/auth";

const baseDepartments: Department[] = [
  {
    id: "dept-all",
    code: "GOG-ALL",
    name: "All Departments / State-Level Access",
    accessScope: "STATE_LEVEL",
  },
  {
    id: "dept-police",
    code: "POL",
    name: "Gujarat Police",
    accessScope: "STATE_LEVEL",
  },
  {
    id: "dept-traffic",
    code: "TRA",
    name: "Traffic Management",
    accessScope: "DISTRICT",
  },
  {
    id: "dept-dmc",
    code: "DMC",
    name: "Disaster Management Center",
    accessScope: "STATE_LEVEL",
  },
  {
    id: "dept-municipal",
    code: "MUN",
    name: "Municipal Corporation",
    accessScope: "LOCAL",
  },
];

// Generate remaining departments up to 26
const extraDepartments: Department[] = Array.from({ length: 21 }).map((_, i) => ({
  id: `dept-${i + 6}`,
  code: `DPT-${i + 6}`,
  name: `Department ${i + 6}`,
  accessScope: "DEPARTMENTAL",
}));

export const MOCK_DEPARTMENTS: Department[] = [...baseDepartments, ...extraDepartments];

export const MOCK_USERS: User[] = [
  // State-Level / All Departments
  {
    id: "u-admin1",
    employeeId: "ADMIN-001",
    name: "State Administrator",
    departmentId: "dept-all",
    role: "SUPER_ADMIN",
  },
  
  // Gujarat Police
  {
    id: "u-pol1",
    employeeId: "GP-1042",
    name: "Officer A. Patel",
    departmentId: "dept-police",
    role: "COMMAND_OFFICER",
  },
  {
    id: "u-pol2",
    employeeId: "GP-2099",
    name: "Inspector M. Desai",
    departmentId: "dept-police",
    role: "SUPERVISOR",
  },

  // Traffic
  {
    id: "u-tra1",
    employeeId: "TR-550",
    name: "Operator S. Shah",
    departmentId: "dept-traffic",
    role: "OPERATOR",
  },

  // Disaster Management
  {
    id: "u-dmc1",
    employeeId: "DM-900",
    name: "Coordinator R. Joshi",
    departmentId: "dept-dmc",
    role: "COORDINATOR",
  },

  // Municipal
  {
    id: "u-mun1",
    employeeId: "MC-112",
    name: "Engineer K. Mehta",
    departmentId: "dept-municipal",
    role: "ANALYST",
  },
];
