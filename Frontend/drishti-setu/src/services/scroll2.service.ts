import { Scroll2Data } from '../types/scroll2';
import { mockScroll2Data } from '../mock/dashboard-scroll2';

class Scroll2Service {
  async getScroll2Data(): Promise<Scroll2Data> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockScroll2Data);
      }, 300);
    });
  }
}

export const scroll2Service = new Scroll2Service();
