import * as penxle from '@penxle/pulumi/components';

const site = new penxle.Site('landing.penxle.com', {
  name: 'landing-penxle-com',

  dns: {
    name: 'penxle.com',
  },

  concurrency: {
    provisioned: 2,
  },
});

export const SITE_DOMAIN = site.siteDomain;
