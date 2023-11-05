import { bedrockRef } from '@penxle/pulumi';
import * as penxle from '@penxle/pulumi/components';
import * as pulumi from '@pulumi/pulumi';

const site = new penxle.Site('penxle.com', {
  name: 'penxle-com',

  dns: {
    name: 'staging.penxle.com',
    zone: 'penxle.com',
  },

  resources: {
    memory: 2048,
  },

  iam: {
    policy: {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
          Resource: [
            pulumi.concat(bedrockRef('AWS_S3_BUCKET_DATA_ARN'), '/*'),
            pulumi.concat(bedrockRef('AWS_S3_BUCKET_UPLOADS_ARN'), '/*'),
          ],
        },
        {
          Effect: 'Allow',
          Action: ['ses:SendEmail'],
          Resource: ['*'],
        },
      ],
    },
  },
});

new penxle.Redirect('www.penxle.com', {
  name: 'www_penxle_com',

  origin: {
    domain: 'www.penxle.com',
    zone: 'penxle.com',
  },

  redirect: {
    to: 'https://penxle.com',
    code: 308,
  },
});

new penxle.Redirect('pnxl.me', {
  name: 'pnxl_me',

  origin: {
    domain: 'pnxl.me',
  },

  redirect: {
    to: 'https://staging.penxle.com/api/shortlink',
    code: 307,
  },
});

export const SITE_DOMAIN = site.siteDomain;
