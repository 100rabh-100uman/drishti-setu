import { DashboardData } from '../types/dashboard';
import { mockDashboardData } from '../mock/dashboard';

class DashboardService {
  /**
   * Fetches live summary metrics for the dashboard from the FastAPI backend.
   * Gracefully falls back to resilient offline baseline if network fails.
   */
  async getDashboardSummary(): Promise<DashboardData> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    try {
      const res = await fetch(`${apiUrl}/dashboard/summary/`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.kpi && typeof data.kpi.totalCameras === 'number') {
          return data as DashboardData;
        }
      }
    } catch (e) {
      console.warn('[DashboardService] Backend /dashboard/summary/ unavailable, using resilient fallback:', e);
    }
    return mockDashboardData;
  }
}

export const dashboardService = new DashboardService();

