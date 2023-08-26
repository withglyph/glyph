import * as penxle from '@penxle/infra/components';

const site = new penxle.Site('penxle.com', {
  name: 'penxle_com',
  domain: 'penxle.com',
  subdomain: 'staging',
});

export const SITE_DOMAIN = site.siteDomain;
