import { Site } from '@penxle/infra-pkg-site';

const site = new Site('penxle.io', {
  name: 'penxle_io',
  domain: 'penxle.io',
});

export const SITE_DOMAIN = site.siteDomain;
