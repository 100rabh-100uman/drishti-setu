// ============================================================
// DRISHTI SETU — Centralized API Endpoints Catalog
// ============================================================
// Defines all FastAPI backend route paths.
// Eliminates hardcoded URL strings across the frontend.
// ============================================================

export const API_ENDPOINTS = {
  CAMERAS: {
    LIST: '/cameras/get_cameras/',
    DETAIL: (cameraId: string) => `/cameras/${encodeURIComponent(cameraId)}`,
    DETAIL_LEGACY: (cameraId: string) => `/cameras/cameras/${encodeURIComponent(cameraId)}`,
    ADD: '/cameras/add_camera/',
    UPDATE: (cameraId: string) => `/cameras/update_camera/${encodeURIComponent(cameraId)}`,
    EVENTS: (cameraId: string) => `/cameras/get_camera_events/${encodeURIComponent(cameraId)}`,
    BULK_IMPORT: '/cameras/bulk_import/',
  },
  DEPARTMENTS: {
    LIST: '/departments/',
    ALIAS_LIST: '/departments/get_departments/',
  },
  ZONES: {
    LIST: '/zones/get_zones/',
    ALIAS_LIST: '/get_zones/',
    GAP_ANALYSIS: '/gap_analysis/',
  },
  USERS: {
    LOGIN: '/users/login/',
    ME: '/users/me/',
    REGISTER: '/users/register_user/',
    LIST: '/users/get_users/',
    ASSIGN_ROLE: '/users/assign_role/',
    UPDATE: (userId: number | string) => `/users/update_user/${userId}`,
    DELETE: (userId: number | string) => `/users/delete_user/${userId}`,
  },
  HEALTH: {
    LIST: '/camera_health/',
    UPDATE: '/update_health/',
  },
  MAINTENANCE: {
    LIST: '/get_maintenance/',
    ADD: '/add_maintenance/',
  },
  AUDIT: {
    LOGS: '/audit_logs/',
    CAMERA_ACTIVITY: (cameraId: string) => `/camera_activity/${encodeURIComponent(cameraId)}`,
  },
  EVENTS: {
    LIST: '/get_events/',
    ADD: '/add_event/',
  },
  OPENCV: {
    ANALYZE_FRAME: '/cameras/analyze_frame/',
    PROCESS_FEED: (cameraId: string) => `/cameras/process_feed/${encodeURIComponent(cameraId)}`,
    PROCESS_FEED_POST: '/cameras/process_feed/',
    STORE_EVENT: '/cameras/store_event/',
    HEALTH_CHECK: (cameraId: string) => `/cameras/health_check/${encodeURIComponent(cameraId)}`,
    HEALTH_CHECK_POST: '/cameras/health_check/',
  },
  ACCESS_REQUESTS: {
    SUBMIT: '/access-requests/',
    LIST: '/access-requests/',
    DETAIL: (requestId: string) => `/access-requests/${encodeURIComponent(requestId)}`,
    APPROVE: (requestId: string) => `/access-requests/${encodeURIComponent(requestId)}/approve`,
    REJECT: (requestId: string) => `/access-requests/${encodeURIComponent(requestId)}/reject`,
    VERIFY_TOKEN: '/access-requests/verify-token',
    ACTIVATE: '/access-requests/activate',
  },
  CRIME_PEOPLE: {
    LIST: '/crime_people/get_all/',
    ADD: '/crime_people/add/',
    UPDATE: (personId: string) => `/crime_people/update/${encodeURIComponent(personId)}`,
    DELETE: (personId: string) => `/crime_people/delete/${encodeURIComponent(personId)}`,
  },
  ALERTS: {
    LIST: '/alerts/get_danger_actions/',
    CREATE: '/alerts/create_danger_action/',
    UPDATE_STATUS: (alertId: string) => `/alerts/update_status/${encodeURIComponent(alertId)}`,
    SIMULATE: (cameraId: string) => `/cameras/simulate_danger_detection/${encodeURIComponent(cameraId)}`,
  },
  INCIDENTS: {
    LIST: '/incidents/get_incidents/',
    TIMELINE: '/incidents/timeline/',
    DETAIL: (incidentId: string) => `/incidents/${encodeURIComponent(incidentId)}`,
    CREATE: '/incidents/create/',
    UPDATE_STATUS: (incidentId: string) => `/incidents/status/${encodeURIComponent(incidentId)}`,
  },
} as const;

export default API_ENDPOINTS;
