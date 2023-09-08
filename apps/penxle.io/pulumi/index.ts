import * as penxle from '@penxle/pulumi/components';

const site = new penxle.Site('penxle.io', {
  name: 'penxle-io',

  dns: {
    name: 'penxle.io',
  },
});

export const SITE_DOMAIN = site.siteDomain;
