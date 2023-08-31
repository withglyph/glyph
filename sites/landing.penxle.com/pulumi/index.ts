import * as penxle from '@penxle/pulumi/components';

const site = new penxle.Site('landing.penxle.com', {
  name: 'landing_penxle_com',
  domain: 'penxle.com',
  zone: 'penxle.com',
});

export const SITE_DOMAIN = site.siteDomain;
