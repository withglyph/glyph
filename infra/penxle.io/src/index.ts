import * as penxle from '@penxle/infra/components';

const site = new penxle.Site('penxle.io', {
  name: 'penxle_io',
  domain: 'penxle.io',
});

export const SITE_DOMAIN = site.siteDomain;
