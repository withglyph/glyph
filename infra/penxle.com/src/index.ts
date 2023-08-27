import * as penxle from '@penxle/infra/components';

const site = new penxle.Site('penxle.com', {
  name: 'penxle_com',
  domain: 'staging.penxle.com',
});

export const SITE_DOMAIN = site.siteDomain;
