import * as pulumi from '@pulumi/pulumi';
import * as withglyph from '@withglyph/pulumi/components';

const config = new pulumi.Config('withglyph');

const site = new withglyph.Site('help', {
  name: 'help',

  domain: {
    production: 'help.withglyph.com',
  },

  image: {
    name: '721144421085.dkr.ecr.ap-northeast-2.amazonaws.com/help',
    digest: config.require('image.digest'),
  },

  resources: {
    cpu: '100m',
    memory: '100Mi',
  },
});

export const SITE_URL = site.url;
