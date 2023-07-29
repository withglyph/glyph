import { inject as setupWebAnalytics } from '@vercel/analytics';
import { browser } from '$app/environment';
import { setupWebVitals } from './web-vitals';

export const setupAnalytics = () => {
  if (browser) {
    setupWebAnalytics();
    setupWebVitals();
  }
};
