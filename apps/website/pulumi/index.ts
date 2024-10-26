import * as pulumi from '@pulumi/pulumi';
import { bedrockRef } from '@withglyph/pulumi';
import * as withglyph from '@withglyph/pulumi/components';

const config = new pulumi.Config('withglyph');

const site = new withglyph.Site('website', {
  name: 'website',

  domain: {
    production: 'withglyph.com',
    staging: 'staging.withglyph.com',
    dev: 'dev.withglyph.com',
  },

  image: {
    name: '721144421085.dkr.ecr.ap-northeast-2.amazonaws.com/website',
    digest: config.require('image.digest'),
  },

  resources: {
    cpu: '1000m',
    memory: '2000Mi',
  },

  autoscale: {
    minCount: 2,
    maxCount: 50,
    averageCpuUtilization: 50,
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
    project: 'website',
  },
});

if (pulumi.getStack() === 'prod') {
  new withglyph.Redirect('www.withglyph.com', {
    name: 'www-withglyph-com',

    from: {
      host: 'www.withglyph.com',
    },

    to: {
      host: 'withglyph.com',
    },

    code: 301,
  });

  new withglyph.Redirect('www.pencil.so', {
    name: 'www-pencil-so',

    from: {
      host: 'www.pencil.so',
    },

    to: {
      host: 'withglyph.com',
    },

    code: 301,
  });

  new withglyph.Redirect('pencil.so', {
    name: 'penxle-so',

    from: {
      host: 'pencil.so',
    },

    to: {
      host: 'withglyph.com',
    },

    code: 301,
  });

  new withglyph.Redirect('www.penxle.com', {
    name: 'www-penxle-com',

    from: {
      host: 'www.penxle.com',
    },

    to: {
      host: 'withglyph.com',
    },

    code: 301,
  });

  new withglyph.Redirect('penxle.com', {
    name: 'penxle-com',

    from: {
      host: 'penxle.com',
    },

    to: {
      host: 'withglyph.com',
    },

    code: 301,
  });

  new withglyph.Redirect('glph.to', {
    name: 'glph-to',

    from: {
      host: 'glph.to',
    },

    to: {
      host: 'withglyph.com',
      path: '/api/shortlink/#{path}',
    },

    code: 302,
  });

  new withglyph.Redirect('pnxl.me', {
    name: 'pnxl-me',

    from: {
      host: 'pnxl.me',
    },

    to: {
      host: 'withglyph.com',
      path: '/api/shortlink/#{path}',
    },

    code: 302,
  });
}

export const SITE_URL = site.url;
