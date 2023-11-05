import * as penxle from '@penxle/pulumi/components';

const site = new penxle.Site('penxle.io', {
  name: 'penxle-io',

  dns: {
    name: 'penxle.io',
  },
});

new penxle.Redirect('www.penxle.io', {
  name: 'www_penxle_io',

  origin: {
    domain: 'www.penxle.io',
    zone: 'penxle.io',
  },

  redirect: {
    to: 'https://penxle.io',
    code: 308,
  },
});

export const SITE_DOMAIN = site.siteDomain;
