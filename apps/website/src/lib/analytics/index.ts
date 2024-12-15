import airtake from '@airtake/browser';
import mixpanel from 'mixpanel-browser';

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
export { default as airtake } from '@airtake/browser';
export { default as mixpanel } from 'mixpanel-browser';
