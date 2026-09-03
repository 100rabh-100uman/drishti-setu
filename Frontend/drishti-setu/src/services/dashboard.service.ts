import { DashboardData } from '../types/dashboard';
import { mockDashboardData } from '../mock/dashboard';

class DashboardService {
  /**
   * Fetches the scroll 1 summary data for the dashboard.
   * Currently uses mock data, but is structured to be replaced with a real API call later.
   */
  async getDashboardSummary(): Promise<DashboardData> {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockDashboardData);
      }, 500);
    });
  }
}

export const dashboardService = new DashboardService();
