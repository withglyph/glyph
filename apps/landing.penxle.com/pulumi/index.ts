import * as penxle from '@penxle/pulumi/components';

const site = new penxle.Site('landing.penxle.com', {
  name: 'landing-penxle-com',

  dns: {
    name: 'penxle.com',
  },
});

export const SITE_DOMAIN = site.siteDomain;
