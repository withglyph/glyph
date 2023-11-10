import Mixpanel from 'mixpanel-browser';
import { PUBLIC_MIXPANEL_TOKEN } from '$env/static/public';

export const setupMixpanel = () => {
  Mixpanel.init(PUBLIC_MIXPANEL_TOKEN, {
    api_host: 'https://x.pnxl.co',
    ignore_dnt: true,
    persistence: 'localStorage',
  });
};

export { default as mixpanel } from 'mixpanel-browser';
