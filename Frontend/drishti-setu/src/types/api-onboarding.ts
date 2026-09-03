// ============================================================
// DRISHTI SETU — API Onboarding Types
// ============================================================

export type AuthMethod = 'API_KEY' | 'BEARER_TOKEN' | 'BASIC_AUTH';

export interface ApiConnectionConfig {
  integration_name: string;
  department: string;
  base_url: string;
  api_version: string;
  endpoint: string;
}

export interface ApiAuthConfig {
  auth_method: AuthMethod;
  api_key_header?: string;
  api_key_value?: string;
  bearer_token?: string;
  username?: string;
  password?: string;
}

export type DrishtiCameraField =
  | 'camera_id'
  | 'department_id'
  | 'zone_id'
  | 'camera_type'
  | 'address'
  | 'status'
  | 'latitude'
  | 'longitude'
  | 'mac_address'
  | 'serial_number'
  | 'device_uuid'
  | 'ip_address'
  | 'needs_review';

export interface FieldMappingItem {
  external_field: string;
  drishti_field: DrishtiCameraField | '';
  required: boolean;
  sample_value?: string;
  description?: string;
}

export interface TestConnectionStepStatus {
  step: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  message?: string;
}

export interface TestConnectionResult {
  success: boolean;
  latency_ms: number;
  status_code: number;
  message: string;
  steps: TestConnectionStepStatus[];
}

export interface PreviewCameraRecord {
  camera_id: string;
  department: string;
  camera_type: string;
  address: string;
  status: string;
  latitude: number;
  longitude: number;
  mac_address: string;
  ip_address: string;
}

export interface ValidationSummary {
  total_records: number;
  valid_records: number;
  missing_fields: number;
  invalid_coordinates: number;
  duplicate_ids: number;
  invalid_records: number;
  is_valid: boolean;
}

export interface SyncStepStatus {
  step: string;
  progress: number;
  status: 'pending' | 'running' | 'completed';
}

export interface ApiSyncResultData {
  records_received: number;
  records_accepted: number;
  records_needing_review: number;
  records_rejected: number;
  sync_timestamp: string;
  integration_name: string;
  department: string;
  endpoint: string;
}
