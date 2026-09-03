// ============================================================
// DRISHTI SETU — Mock Zones for Camera Registration
// ============================================================

import { Zone } from '@/types/camera';

export const MOCK_ZONES: Zone[] = [
  // Gujarat Police zones
  { id: 'zone-ahm-west', name: 'Ahmedabad West', department_id: 'dept-police' },
  { id: 'zone-ahm-east', name: 'Ahmedabad East', department_id: 'dept-police' },
  { id: 'zone-ahm-north', name: 'Ahmedabad North', department_id: 'dept-police' },
  { id: 'zone-surat', name: 'Surat City', department_id: 'dept-police' },
  { id: 'zone-vadodara', name: 'Vadodara City', department_id: 'dept-police' },
  { id: 'zone-rajkot', name: 'Rajkot City', department_id: 'dept-police' },
  { id: 'zone-gandhinagar', name: 'Gandhinagar', department_id: 'dept-police' },

  // Traffic Management zones
  { id: 'zone-tra-central', name: 'Central Traffic Zone', department_id: 'dept-traffic' },
  { id: 'zone-tra-highway', name: 'Highway Corridor', department_id: 'dept-traffic' },
  { id: 'zone-tra-urban', name: 'Urban Traffic Zone', department_id: 'dept-traffic' },

  // Disaster Management Center zones
  { id: 'zone-dmc-coastal', name: 'Coastal Monitoring', department_id: 'dept-dmc' },
  { id: 'zone-dmc-flood', name: 'Flood Prone Areas', department_id: 'dept-dmc' },
  { id: 'zone-dmc-central', name: 'DMC Central Command', department_id: 'dept-dmc' },

  // Municipal Corporation zones
  { id: 'zone-mun-ward1', name: 'Ward 1 – Central', department_id: 'dept-municipal' },
  { id: 'zone-mun-ward2', name: 'Ward 2 – East', department_id: 'dept-municipal' },
  { id: 'zone-mun-ward3', name: 'Ward 3 – West', department_id: 'dept-municipal' },
  { id: 'zone-mun-ward4', name: 'Ward 4 – South', department_id: 'dept-municipal' },

  // Forest Department zones
  { id: 'zone-for-gir', name: 'Gir Sanctuary', department_id: 'dept-forest' },
  { id: 'zone-for-dang', name: 'Dang Forest', department_id: 'dept-forest' },

  // Transport Department zones
  { id: 'zone-trn-rto', name: 'RTO Office Area', department_id: 'dept-transport' },
  { id: 'zone-trn-depot', name: 'Bus Depot Zone', department_id: 'dept-transport' },

  // Revenue Department zones
  { id: 'zone-rev-hq', name: 'Revenue HQ', department_id: 'dept-revenue' },

  // PWD zones
  { id: 'zone-pwd-road', name: 'Road Infrastructure', department_id: 'dept-pwd' },
  { id: 'zone-pwd-bridge', name: 'Bridge Surveillance', department_id: 'dept-pwd' },

  // Health zones
  { id: 'zone-hfw-hospital', name: 'Hospital Campus', department_id: 'dept-health' },
  { id: 'zone-hfw-phc', name: 'Primary Health Centers', department_id: 'dept-health' },

  // Education zones
  { id: 'zone-edu-campus', name: 'University Campus', department_id: 'dept-education' },
  { id: 'zone-edu-school', name: 'School Zones', department_id: 'dept-education' },
];
