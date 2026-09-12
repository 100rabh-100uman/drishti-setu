// ============================================================
// DRISHTI SETU — Camera Types
// ============================================================

export type CameraType = 'IP' | 'Analog';

export type CameraStatus = 'Active' | 'Inactive' | 'Maintenance' | 'Offline';

export interface Camera {
  id: string;                // database primary key (backend generated)
  camera_id: string;         // user-facing unique identifier
  department_id: string;     // references department
  zone_id: string;           // references zone
  camera_type: CameraType;
  address: string;
  status: CameraStatus;
  latitude: number;
  longitude: number;
  lat?: number;
  lng?: number;
  mac_address: string;
  serial_number: string;
  device_uuid?: string;
  ip_address: string;
  needs_review: boolean;
  department_name?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Form-facing data structure.
 * Uses human-readable names for department/zone (not IDs).
 * The service layer maps these to IDs before sending to backend.
 */
export interface CameraFormData {
  // Step 1 — Identity
  camera_id: string;
  serial_number: string;
  device_uuid: string;

  // Step 2 — Department & Location
  department: string;       // department name (UI-facing)
  zone: string;             // zone name (UI-facing)
  address: string;
  latitude: string;         // string for form input, parsed to number on submit
  longitude: string;

  // Step 3 — Camera & Network
  camera_type: CameraType | '';
  mac_address: string;
  ip_address: string;

  // Step 4 — Status
  status: CameraStatus | '';
  needs_review: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Zone {
  id: string;
  name: string;
  department_id: string;
}

export interface CameraCreatePayload {
  camera_id: string;
  department_id: string;
  zone_id: string;
  camera_type: CameraType;
  address: string;
  latitude: number;
  longitude: number;
  mac_address: string;
  serial_number: string;
  device_uuid: string;
  ip_address: string;
  status: CameraStatus;
  needs_review: boolean;
}

export interface CameraCreateResponse {
  success: boolean;
  camera: Camera;
  message: string;
}

export const CAMERA_TYPE_OPTIONS: { value: CameraType; label: string }[] = [
  { value: 'IP', label: 'IP-based Camera' },
  { value: 'Analog', label: 'Analog-based Camera' },
];

export const CAMERA_STATUS_OPTIONS: { value: CameraStatus; label: string; color: string }[] = [
  { value: 'Active', label: 'Active', color: 'text-green-600' },
  { value: 'Inactive', label: 'Inactive', color: 'text-slate-500' },
  { value: 'Maintenance', label: 'Maintenance', color: 'text-amber-600' },
  { value: 'Offline', label: 'Offline', color: 'text-red-600' },
];
