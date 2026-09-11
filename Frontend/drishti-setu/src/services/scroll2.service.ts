import { Scroll2Data } from '../types/scroll2';
import { mockScroll2Data } from '../mock/dashboard-scroll2';

class Scroll2Service {
  async getScroll2Data(): Promise<Scroll2Data> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    try {
      const res = await fetch(`${apiUrl}/dashboard/scroll2/`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.departments)) {
          return {
            ...mockScroll2Data,
            ...data
          } as Scroll2Data;
        }
      }
    } catch (e) {
      console.warn('[Scroll2Service] Backend /dashboard/scroll2/ unavailable, using resilient fallback:', e);
    }
    return mockScroll2Data;
  }
}

export const scroll2Service = new Scroll2Service();

