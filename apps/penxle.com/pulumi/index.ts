import { bedrockRef } from '@penxle/pulumi';
import * as penxle from '@penxle/pulumi/components';
import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config('penxle');

const site = new penxle.Site('penxle.com', {
  name: 'penxle-com',
  domainName: 'staging.penxle.com',

  image: {
    name: '721144421085.dkr.ecr.ap-northeast-2.amazonaws.com/penxle.com',
    digest: config.require('image.digest'),
  },

  resources: {
    cpu: '500m',
    memory: '500Mi',
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

  secret: {
    project: 'penxle-com',
  },
});

export const SITE_URL = site.url;
