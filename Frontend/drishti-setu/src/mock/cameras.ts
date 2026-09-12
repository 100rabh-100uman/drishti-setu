// ============================================================
// DRISHTI SETU — Mock Camera Data
// ============================================================

import { Camera } from '@/types/camera';

export const MOCK_CAMERAS: Camera[] = [
  {
    id: 'db-001',
    camera_id: 'CAM-GJ-AHM-000001',
    department_id: 'dept-police',
    zone_id: 'zone-ahm-west',
    camera_type: 'IP',
    address: 'Police HQ, 2nd Floor, Sector 17, Gandhinagar, Gujarat',
    status: 'Active',
    latitude: 23.0225,
    longitude: 72.5714,
    mac_address: '00:1A:2B:3C:4D:5E',
    serial_number: 'SN-2024-00001',
    device_uuid: '550e8400-e29b-41d4-a716-446655440000',
    ip_address: '192.168.1.10',
    storage_type: 'Cloud',
    storage_days: 60,
    needs_review: false,
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 'db-002',
    camera_id: 'CAM-GJ-AHM-000002',
    department_id: 'dept-police',
    zone_id: 'zone-ahm-east',
    camera_type: 'Analog',
    address: 'Maninagar Crossing, Near Bus Stand, Ahmedabad',
    status: 'Active',
    latitude: 23.0069,
    longitude: 72.6042,
    mac_address: '00:1A:2B:3C:4D:5F',
    serial_number: 'SN-2024-00002',
    device_uuid: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    ip_address: '192.168.1.11',
    storage_type: 'Local',
    storage_days: 30,
    needs_review: false,
    created_at: '2024-01-16T14:00:00Z',
  },
];

// Existing camera IDs for uniqueness mock validation
export const EXISTING_CAMERA_IDS = MOCK_CAMERAS.map(c => c.camera_id);
