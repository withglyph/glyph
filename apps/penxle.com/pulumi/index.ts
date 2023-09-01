import * as penxle from '@penxle/pulumi/components';

const site = new penxle.Site('penxle.com', {
  name: 'penxle-com',

  dns: {
    name: 'staging.penxle.com',
    zone: 'penxle.com',
  },

  iam: {
    policy: {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: ['s3:PutObject'],
          Resource: ['arn:aws:s3:::penxle-uploads/*'],
        },
      ],
    },
  },
});

export const SITE_DOMAIN = site.siteDomain;
