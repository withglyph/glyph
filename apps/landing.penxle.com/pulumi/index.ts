import * as penxle from '@penxle/pulumi/components';
import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config('penxle');

const site = new penxle.Site('landing.penxle.com', {
  name: 'landing-penxle-com',
  domainName: 'penxle.com',

  image: {
    name: '721144421085.dkr.ecr.ap-northeast-2.amazonaws.com/landing.penxle.com',
    digest: config.require('image.digest'),
  },

  resources: {
    cpu: '100m',
    memory: '100Mi',
  },

  secret: {
    project: 'landing-penxle-com',
  },
});

export const SITE_URL = site.url;
