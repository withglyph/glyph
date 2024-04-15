import * as pulumi from '@pulumi/pulumi';
import * as withglyph from '@withglyph/pulumi/components';

const config = new pulumi.Config('withglyph');

const site = new withglyph.Site('penxle.io', {
  name: 'company',

  domain: {
    production: 'penxle.io',
  },

  image: {
    name: '721144421085.dkr.ecr.ap-northeast-2.amazonaws.com/company',
    digest: config.require('image.digest'),
  },

  resources: {
    cpu: '100m',
    memory: '100Mi',
  },
});

if (pulumi.getStack() === 'prod') {
  new withglyph.Redirect('www.penxle.io', {
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
