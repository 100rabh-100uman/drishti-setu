export type AccessRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type PlatformRole = 'Admin' | 'Inspector' | 'Viewer';

export interface AccessRequestSubmitPayload {
  full_name: string;
  employee_id: string;
  official_email: string;
  mobile_number: string;
  department_id: number;
  designation: string;
  office_unit: string;
  district: string;
  requested_role: PlatformRole;
  reason: string;
}

export interface AccessRequestSubmitResponse {
  message: string;
  request_id: string;
  status: AccessRequestStatus;
  employee_id: string;
  department_name: string;
  requested_role: PlatformRole;
  created_at: string;
}

export interface AccessRequest {
  id: number;
  request_id: string;
  full_name: string;
  employee_id: string;
  official_email: string;
  mobile_number: string;
  department_id: number;
  designation: string;
  office_unit: string;
  district: string;
  requested_role: PlatformRole;
  reason: string;
  status: AccessRequestStatus;
  reviewed_by: number | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  user_id?: number | null;
  activation_token?: string | null;
  activation_token_expires_at?: string | null;
  activated_at?: string | null;
  created_at: string;
  updated_at?: string;
  departments?: {
    name: string;
  };
}

export interface AccessRequestListResponse {
  requests: AccessRequest[];
  count: number;
}

export interface AccessRequestApprovePayload {
  role?: PlatformRole;
}

export interface AccessRequestApproveResponse {
  message: string;
  request_id: string;
  status: AccessRequestStatus;
  user_id: number;
  employee_id: string;
  role: PlatformRole;
  demo_activation_url?: string;
  demo_note?: string;
  demo_credentials?: {
    employee_id: string;
    username: string;
    password: string;
    role: string;
    note: string;
  };
}

export interface AccessRequestRejectPayload {
  rejection_reason: string;
}

export interface TokenVerifyResponse {
  valid: boolean;
  full_name: string;
  employee_id: string;
  department_name: string;
  requested_role: PlatformRole;
}

export interface ActivateAccountPayload {
  token: string;
  password: string;
}

export interface ActivateAccountResponse {
  message: string;
  employee_id: string;
  status: string;
}
