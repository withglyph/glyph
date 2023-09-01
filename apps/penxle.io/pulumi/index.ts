import * as penxle from '@penxle/pulumi/components';

const site = new penxle.Site('penxle.io', {
  name: 'penxle_io',
  domain: 'penxle.io',
  zone: 'penxle.io',
});

export const SITE_DOMAIN = site.siteDomain;
