import * as penxle from '@penxle/pulumi/components';
import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config('penxle');

const site = new penxle.Site('penxle.io', {
  name: 'company',

  domain: {
    production: 'penxle.io',
    staging: 'staging.penxle.io',
  },

  image: {
    name: '721144421085.dkr.ecr.ap-northeast-2.amazonaws.com/penxle.io',
    digest: config.require('image.digest'),
  },

  resources: {
    cpu: '100m',
    memory: '100Mi',
  },
});

if (pulumi.getStack() === 'prod') {
  new penxle.Redirect('www.penxle.io', {
    name: 'www-penxle-io',

    from: {
      host: 'www.penxle.io',
    },

    to: {
      host: 'penxle.io',
    },

    code: 301,
  });
}

export const SITE_URL = site.url;
