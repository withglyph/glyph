import mixpanel from 'mixpanel-browser';
import { airtake } from './airtake';

export * from './airtake';
export * from './mixpanel';

const analytics = {
  track: (event: string, properties?: Record<string, unknown>) => {
    mixpanel.track(event, properties);
    airtake.track(event, properties as never);
  },

  reset: () => {
    mixpanel.reset();
    airtake.reset();
  },
};

export { analytics };
export { airtake } from './airtake';
export { default as mixpanel } from 'mixpanel-browser';
