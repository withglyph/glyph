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

export const SITE_DOMAIN = site.siteDomain;
