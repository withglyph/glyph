import * as penxle from '@penxle/infra/components';

const site = new penxle.Site('help.penxle.com', {
  name: 'help_penxle_com',
  domain: 'penxle.com',
  subdomain: 'help',
});

export const SITE_DOMAIN = site.siteDomain;
