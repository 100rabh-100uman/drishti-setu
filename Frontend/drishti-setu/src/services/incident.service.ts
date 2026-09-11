import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from './api/endpoints';

export interface IncidentPerson {
  id?: string;
  person_id?: string;
  name: string;
  photo?: string;
  crime_type?: string;
  record_summary?: string;
  status?: string;
  department_id?: number;
}

export interface Incident {
  id: string;
  timestamp: string;
  crime_type: string;
  description: string;
  location_id: string;
  location_name?: string;
  department_name?: string;
  severity?: 'Critical' | 'High' | 'Medium' | 'Low';
  person?: IncidentPerson | null;
}

export const incidentService = {
  async getIncidents(limit: number = 50, crimeType?: string): Promise<Incident[]> {
    try {
      const params = new URLSearchParams();
      if (limit) params.set('limit', limit.toString());
      if (crimeType) params.set('crime_type', crimeType);

      const query = params.toString() ? `?${params.toString()}` : '';
      const endpoint = `${API_ENDPOINTS.INCIDENTS.LIST}${query}`;

      const res = await apiClient.get<Incident[] | { incidents?: Incident[] }>(endpoint);
      if (Array.isArray(res)) {
        return res;
      }
      if (res && Array.isArray((res as any).incidents)) {
        return (res as any).incidents;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
      return [];
    }
  },

  async addIncident(data: {
    crime_type: string;
    description: string;
    location_id: string;
    person_id?: string;
    severity?: string;
  }): Promise<any> {
    return apiClient.post(API_ENDPOINTS.INCIDENTS.ADD, data);
  }
};

export default incidentService;
