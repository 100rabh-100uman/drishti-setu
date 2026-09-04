// ============================================================
// DRISHTI SETU — Danger Actions & Crime Bureau Service
// ============================================================
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from './api/endpoints';

export interface CrimePerson {
  person_id: string;
  name: string;
  photo: string;
  crime_type: string;
  department_id: number;
  status: 'WANTED' | 'HIGH_ALERT' | 'UNDER_SURVEILLANCE' | 'APPREHENDED' | string;
  created_at?: string;
  updated_at?: string;
}

export interface DangerAction {
  id: string;
  person_id: string;
  person_name?: string;
  person_photo?: string;
  crime_type?: string;
  camera_id: string;
  camera_address?: string;
  event_type: string;
  timestamp: string;
  department_id: number;
  department_name?: string;
  alert_status: 'ACTIVE' | 'DISPATCHED' | 'RESOLVED' | 'FALSE_POSITIVE' | string;
  metadata?: {
    confidence?: number;
    zone?: string;
    lat?: number;
    lng?: number;
    vehicle_plate?: string;
    detection_method?: string;
    status_notes?: string;
    [key: string]: unknown;
  };
}

export interface Incident {
  id: string;
  incident_number: string;
  title: string;
  crime_type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  status: 'ACTIVE' | 'DISPATCHED' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED' | string;
  camera_id: string;
  person_id?: string | null;
  person_name?: string;
  person_photo?: string;
  department_id: number;
  department_name?: string;
  zone_id?: string;
  location_name?: string;
  timestamp: string;
  metadata?: {
    confidence?: number;
    speed_kmh?: number;
    threat_level?: string;
    vehicle_plate?: string;
    vehicle_model?: string;
    notes?: string;
    resolution?: string;
    [key: string]: unknown;
  };
  created_at?: string;
  updated_at?: string;
}

export interface IncidentGroup {
  date_label: string;
  count: number;
  incidents: Incident[];
}

export interface GetIncidentsParams {
  department_id?: number;
  zone_id?: string;
  crime_type?: string;
  person_id?: string;
  status?: string;
  severity?: string;
  hours?: number;
  limit?: number;
}

export interface GetDangerActionsParams {
  department_id?: number;
  camera_id?: string;
  alert_status?: string;
  hours?: number;
  limit?: number;
}

export interface GetCrimePeopleParams {
  department_id?: number;
  status_filter?: string;
}

export const dangerActionService = {
  /**
   * Fetches real-time danger actions for surveillance dashboards & GIS map.
   */
  async getDangerActions(params?: GetDangerActionsParams): Promise<DangerAction[]> {
    const query = new URLSearchParams();
    if (params?.department_id) query.append('department_id', params.department_id.toString());
    if (params?.camera_id) query.append('camera_id', params.camera_id);
    if (params?.alert_status && params.alert_status !== 'ALL') query.append('alert_status', params.alert_status);
    if (params?.hours) query.append('hours', params.hours.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const url = `${API_ENDPOINTS.ALERTS.LIST}${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await apiClient.get<{ alerts?: DangerAction[]; error?: string }>(url);
    return res.alerts || [];
  },

  /**
   * Creates a new danger action alert (typically triggered when OpenCV face recognition matches).
   */
  async createDangerAction(action: {
    person_id: string;
    camera_id: string;
    department_id: number;
    event_type?: string;
    alert_status?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ message: string; alert: DangerAction }> {
    return apiClient.post(API_ENDPOINTS.ALERTS.CREATE, action);
  },

  /**
   * Transitions an alert status (e.g., ACTIVE -> DISPATCHED -> RESOLVED).
   */
  async updateAlertStatus(alertId: string, alert_status: string, notes?: string): Promise<unknown> {
    return apiClient.put(API_ENDPOINTS.ALERTS.UPDATE_STATUS(alertId), {
      alert_status,
      notes,
    });
  },

  /**
   * Fetches all registered criminal records from the Crime Bureau watchlist.
   */
  async getCrimePeople(params?: GetCrimePeopleParams): Promise<CrimePerson[]> {
    const query = new URLSearchParams();
    if (params?.department_id) query.append('department_id', params.department_id.toString());
    if (params?.status_filter && params.status_filter !== 'ALL') query.append('status_filter', params.status_filter);

    const url = `${API_ENDPOINTS.CRIME_PEOPLE.LIST}${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await apiClient.get<{ crime_people?: CrimePerson[]; error?: string }>(url);
    return res.crime_people || [];
  },

  /**
   * Adds a new suspect record to the bureau watchlist.
   */
  async addCrimePerson(person: {
    person_id?: string;
    name: string;
    photo: string;
    crime_type: string;
    department_id: number;
    status: string;
  }): Promise<unknown> {
    return apiClient.post(API_ENDPOINTS.CRIME_PEOPLE.ADD, person);
  },

  /**
   * Updates an existing suspect record.
   */
  async updateCrimePerson(personId: string, updates: Partial<CrimePerson>): Promise<unknown> {
    return apiClient.put(API_ENDPOINTS.CRIME_PEOPLE.UPDATE(personId), updates);
  },

  /**
   * Removes a suspect record from the bureau watchlist.
   */
  async deleteCrimePerson(personId: string): Promise<unknown> {
    return apiClient.delete(API_ENDPOINTS.CRIME_PEOPLE.DELETE(personId));
  },

  /**
   * Simulates an OpenCV face detection trigger against a camera.
   */
  async simulateDetection(cameraId: string, personId?: string): Promise<unknown> {
    const url = API_ENDPOINTS.ALERTS.SIMULATE(cameraId);
    return apiClient.post(url, personId ? { person_id: personId } : {});
  },

  /**
   * Fetches incidents with multi-filtering (zone, crime type, person, severity, status).
   */
  async getIncidents(params?: GetIncidentsParams): Promise<Incident[]> {
    const query = new URLSearchParams();
    if (params?.department_id) query.append('department_id', params.department_id.toString());
    if (params?.zone_id && params.zone_id !== 'ALL') query.append('zone_id', params.zone_id);
    if (params?.crime_type && params.crime_type !== 'ALL') query.append('crime_type', params.crime_type);
    if (params?.person_id && params.person_id !== 'ALL') query.append('person_id', params.person_id);
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);
    if (params?.severity && params.severity !== 'ALL') query.append('severity', params.severity);
    if (params?.hours) query.append('hours', params.hours.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const url = `${API_ENDPOINTS.INCIDENTS.LIST}${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await apiClient.get<{ incidents?: Incident[]; error?: string }>(url);
    return res.incidents || [];
  },

  /**
   * Fetches timeline groups (pre-grouped by Today, Yesterday, Date) for the Incident Corner.
   */
  async getIncidentTimeline(params?: GetIncidentsParams): Promise<IncidentGroup[]> {
    const query = new URLSearchParams();
    if (params?.department_id) query.append('department_id', params.department_id.toString());
    if (params?.zone_id && params.zone_id !== 'ALL') query.append('zone_id', params.zone_id);
    if (params?.crime_type && params.crime_type !== 'ALL') query.append('crime_type', params.crime_type);
    if (params?.person_id && params.person_id !== 'ALL') query.append('person_id', params.person_id);
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);
    if (params?.limit) query.append('limit', params.limit.toString());

    const url = `${API_ENDPOINTS.INCIDENTS.TIMELINE}${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await apiClient.get<{ groups?: IncidentGroup[]; error?: string }>(url);
    return res.groups || [];
  },

  /**
   * Creates a new incident.
   */
  async createIncident(incident: Partial<Incident>): Promise<{ message: string; incident: Incident }> {
    return apiClient.post(API_ENDPOINTS.INCIDENTS.CREATE, incident);
  },

  /**
   * Transitions an incident status (ACTIVE -> DISPATCHED -> INVESTIGATING -> RESOLVED -> CLOSED).
   */
  async updateIncidentStatus(incidentId: string, status: string, notes?: string): Promise<unknown> {
    return apiClient.put(API_ENDPOINTS.INCIDENTS.UPDATE_STATUS(incidentId), {
      status,
      notes,
    });
  },
};

export default dangerActionService;
