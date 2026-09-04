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
    [key: string]: any;
  };
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
    metadata?: Record<string, any>;
  }): Promise<{ message: string; alert: DangerAction }> {
    return apiClient.post(API_ENDPOINTS.ALERTS.CREATE, action);
  },

  /**
   * Transitions an alert status (e.g., ACTIVE -> DISPATCHED -> RESOLVED).
   */
  async updateAlertStatus(alertId: string, alert_status: string, notes?: string): Promise<any> {
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
  }): Promise<any> {
    return apiClient.post(API_ENDPOINTS.CRIME_PEOPLE.ADD, person);
  },

  /**
   * Updates an existing suspect record.
   */
  async updateCrimePerson(personId: string, updates: Partial<CrimePerson>): Promise<any> {
    return apiClient.put(API_ENDPOINTS.CRIME_PEOPLE.UPDATE(personId), updates);
  },

  /**
   * Removes a suspect record from the bureau watchlist.
   */
  async deleteCrimePerson(personId: string): Promise<any> {
    return apiClient.delete(API_ENDPOINTS.CRIME_PEOPLE.DELETE(personId));
  },

  /**
   * Simulates an OpenCV face detection trigger against a camera.
   */
  async simulateDetection(cameraId: string, personId?: string): Promise<any> {
    const url = API_ENDPOINTS.ALERTS.SIMULATE(cameraId);
    return apiClient.post(url, personId ? { person_id: personId } : {});
  },
};

export default dangerActionService;
