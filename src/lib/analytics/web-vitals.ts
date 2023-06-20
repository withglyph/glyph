import { get } from 'svelte/store';
import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals';
import { page } from '$app/stores';
import { PUBLIC_VERCEL_ANALYTICS_ID } from '$env/static/public';
import type { Metric } from 'web-vitals';

const reportUrl = 'https://vitals.vercel-analytics.com/v1/vitals';
const eventListeners = [onCLS, onFCP, onFID, onINP, onLCP, onTTFB];

const onEvent = (metric: Metric) => {
  if (!PUBLIC_VERCEL_ANALYTICS_ID || !('sendBeacon' in navigator)) {
    return;
  }

  const $page = get(page);

  const parameters = new URLSearchParams({
    dsn: PUBLIC_VERCEL_ANALYTICS_ID,
    id: metric.id,
    event_name: metric.name,
    value: metric.value.toString(),
    href: $page.url.href,
    page: $page.route.id ?? '(unknown)',
    // @ts-expect-error: navigator connection is not yet in the types
    speed: navigator.connection?.effectiveType ?? '',
  });

  navigator.sendBeacon(reportUrl, parameters);
};

export const setupWebVitals = () => {
  for (const register of eventListeners) {
    register(onEvent);
  }
};
