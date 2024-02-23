import { bedrockRef } from '@penxle/pulumi';
import * as penxle from '@penxle/pulumi/components';
import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config('penxle');

const site = new penxle.Site('pencil.so', {
  name: 'pencil',

  domain: {
    production: 'pencil.so',
    staging: 'staging.pencil.so',
    dev: 'dev.pencil.so',
  },

  image: {
    name: '721144421085.dkr.ecr.ap-northeast-2.amazonaws.com/penxle.com',
    digest: config.require('image.digest'),
  },

  resources: {
    cpu: '1000m',
    memory: '2000Mi',
  },

  autoscale: {
    minCount: 2,
    maxCount: 20,
  },

  iam: {
    policy: {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: ['s3:GetObject', 's3:PutObject'],
          Resource: [
            pulumi.concat(bedrockRef('AWS_S3_BUCKET_DATA_ARN'), '/*'),
            pulumi.concat(bedrockRef('AWS_S3_BUCKET_UPLOADS_ARN'), '/*'),
          ],
        },
        {
          Effect: 'Allow',
          Action: ['s3:DeleteObject'],
          Resource: [pulumi.concat(bedrockRef('AWS_S3_BUCKET_UPLOADS_ARN'), '/*')],
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

if (pulumi.getStack() === 'prod') {
  new penxle.Redirect('www.pencil.so', {
    name: 'www-pencil-so',

    from: {
      host: 'www.pencil.so',
    },

    to: {
      host: 'pencil.so',
    },

    code: 301,
  });

  new penxle.Redirect('penxle.com', {
    name: 'penxle-com',

    from: {
      host: 'penxle.com',
    },

    to: {
      host: 'pencil.so',
    },

    code: 301,
  });

  new penxle.Redirect('www.penxle.com', {
    name: 'www-penxle-com',

    from: {
      host: 'www.penxle.com',
    },

    to: {
      host: 'pencil.so',
    },

    code: 301,
  });

  new penxle.Redirect('pnxl.me', {
    name: 'pnxl-me',

    from: {
      host: 'pnxl.me',
    },

    to: {
      host: 'pencil.so',
      path: '/api/shortlink/#{path}',
    },

    code: 302,
  });
}

export const SITE_URL = site.url;
