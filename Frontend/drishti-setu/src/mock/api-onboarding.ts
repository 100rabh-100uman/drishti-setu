// ============================================================
// DRISHTI SETU — API Onboarding Mock Data
// ============================================================

import { FieldMappingItem, DrishtiCameraField, PreviewCameraRecord, ApiSyncResultData } from '@/types/api-onboarding';

export const DRISHTI_TARGET_FIELDS: { value: DrishtiCameraField; label: string; description: string; required: boolean }[] = [
  { value: 'camera_id', label: 'Camera Identifier (camera_id)', description: 'Unique device code', required: true },
  { value: 'department_id', label: 'Department Assignment (department_id)', description: 'Department jurisdiction', required: true },
  { value: 'zone_id', label: 'Zone Assignment (zone_id)', description: 'Operational subdivision', required: true },
  { value: 'camera_type', label: 'Camera Type (camera_type)', description: 'IP-based or Analog', required: true },
  { value: 'address', label: 'Physical Location Address (address)', description: 'Street / installation address', required: true },
  { value: 'latitude', label: 'Geo-Latitude (latitude)', description: 'WGS84 decimal latitude', required: true },
  { value: 'longitude', label: 'Geo-Longitude (longitude)', description: 'WGS84 decimal longitude', required: true },
  { value: 'status', label: 'Surveillance Status (status)', description: 'Active / Offline / Maintenance', required: true },
  { value: 'mac_address', label: 'Hardware MAC (mac_address)', description: 'Network interface hardware address', required: false },
  { value: 'serial_number', label: 'Serial Number (serial_number)', description: 'Manufacturer hardware SN', required: false },
  { value: 'device_uuid', label: 'Device UUID (device_uuid)', description: 'UUID v4 device signature', required: false },
  { value: 'ip_address', label: 'Network IPv4 (ip_address)', description: 'LAN/WAN network IP', required: false },
  { value: 'needs_review', label: 'Review Flag (needs_review)', description: 'Requires operator manual audit', required: false },
];

export const DEFAULT_FIELD_MAPPINGS: FieldMappingItem[] = [
  { external_field: 'camera_id', drishti_field: 'camera_id', required: true, sample_value: 'CAM-GJ-AHM-000421', description: 'Primary camera key' },
  { external_field: 'department', drishti_field: 'department_id', required: true, sample_value: 'Gujarat Police', description: 'Administrative department' },
  { external_field: 'zone', drishti_field: 'zone_id', required: true, sample_value: 'Ahmedabad West', description: 'Sub-zone area' },
  { external_field: 'camera_type', drishti_field: 'camera_type', required: true, sample_value: 'IP-based', description: 'Hardware transmission type' },
  { external_field: 'address', drishti_field: 'address', required: true, sample_value: 'Income Tax Circle, Ashram Road', description: 'Physical installation point' },
  { external_field: 'latitude', drishti_field: 'latitude', required: true, sample_value: '23.0421', description: 'Geo coordinates' },
  { external_field: 'longitude', drishti_field: 'longitude', required: true, sample_value: '72.5711', description: 'Geo coordinates' },
  { external_field: 'status', drishti_field: 'status', required: true, sample_value: 'Active', description: 'Current heartbeat state' },
  { external_field: 'mac_address', drishti_field: 'mac_address', required: false, sample_value: '00:1A:2B:3C:4D:5E', description: 'Hardware address' },
  { external_field: 'serial_number', drishti_field: 'serial_number', required: false, sample_value: 'SN-2026-IT421', description: 'Serial number' },
  { external_field: 'device_uuid', drishti_field: 'device_uuid', required: false, sample_value: '550e8400-e29b-41d4-a716-446655440421', description: 'Hardware UUID' },
  { external_field: 'ip_address', drishti_field: 'ip_address', required: false, sample_value: '192.168.12.42', description: 'Network IP' },
  { external_field: 'needs_review', drishti_field: 'needs_review', required: false, sample_value: 'false', description: 'Audit flag' },
];

export const MOCK_API_PREVIEW_RECORDS: PreviewCameraRecord[] = [
  {
    camera_id: 'CAM-GJ-AHM-000421',
    department: 'Gujarat Police',
    camera_type: 'IP-based',
    address: 'Income Tax Circle, Ashram Road, Ahmedabad',
    status: 'Active',
    latitude: 23.0421,
    longitude: 72.5711,
    mac_address: '00:1A:2B:3C:4D:21',
    ip_address: '192.168.12.41',
  },
  {
    camera_id: 'CAM-GJ-AHM-000422',
    department: 'Gujarat Police',
    camera_type: 'IP-based',
    address: 'Shivranjani Cross Road, Satellite, Ahmedabad',
    status: 'Active',
    latitude: 23.0234,
    longitude: 72.5298,
    mac_address: '00:1A:2B:3C:4D:22',
    ip_address: '192.168.12.42',
  },
  {
    camera_id: 'CAM-GJ-AHM-000423',
    department: 'Gujarat Police',
    camera_type: 'IP-based',
    address: 'Paldi Circle Underpass, Ahmedabad',
    status: 'Active',
    latitude: 23.0125,
    longitude: 72.5642,
    mac_address: '00:1A:2B:3C:4D:23',
    ip_address: '192.168.12.43',
  },
  {
    camera_id: 'CAM-GJ-AHM-000424',
    department: 'Gujarat Police',
    camera_type: 'Analog',
    address: 'Geeta Mandir Central Bus Station, Ahmedabad',
    status: 'Maintenance',
    latitude: 23.0118,
    longitude: 72.5934,
    mac_address: '00:1A:2B:3C:4D:24',
    ip_address: '192.168.12.44',
  },
  {
    camera_id: 'CAM-GJ-AHM-000425',
    department: 'Gujarat Police',
    camera_type: 'IP-based',
    address: 'Ellisbridge Corner, Riverfront East, Ahmedabad',
    status: 'Active',
    latitude: 23.0289,
    longitude: 72.5788,
    mac_address: '00:1A:2B:3C:4D:25',
    ip_address: '192.168.12.45',
  },
];

export const MOCK_DEFAULT_SYNC_RESULT: ApiSyncResultData = {
  records_received: 482,
  records_accepted: 468,
  records_needing_review: 10,
  records_rejected: 4,
  sync_timestamp: new Date().toISOString(),
  integration_name: 'Ahmedabad Traffic CCTV',
  department: 'Gujarat Police',
  endpoint: 'cameras',
};
