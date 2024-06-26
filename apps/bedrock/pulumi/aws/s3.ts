import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

const data = new aws.s3.Bucket('data', {
  bucket: 'penxle-data',
});

new aws.s3.BucketPolicy('data', {
  bucket: data.bucket,
  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { Service: 'cloudfront.amazonaws.com' },
        Action: ['s3:GetObject'],
        Resource: [pulumi.interpolate`${data.arn}/*`],
      },
    ],
  },
});

const caches = new aws.s3.Bucket('caches', {
  bucket: 'penxle-caches',
});

const uploads = new aws.s3.Bucket('uploads', {
  bucket: 'penxle-uploads',
  corsRules: [
    {
      allowedHeaders: ['*'],
      allowedMethods: ['PUT'],
      allowedOrigins: [
        'https://withglyph.com',
        'https://staging.withglyph.com',
        'https://dev.withglyph.com',
        'https://*.withglyph.dev',
        'http://localhost:4000',
      ],
    },
  ],
});

export const buckets = { caches, data, uploads };

export const outputs = {
  AWS_S3_BUCKET_CACHES_BUCKET: caches.bucket,
  AWS_S3_BUCKET_DATA_BUCKET: data.bucket,
  AWS_S3_BUCKET_UPLOADS_BUCKET: uploads.bucket,

  AWS_S3_BUCKET_CACHES_ARN: caches.arn,
  AWS_S3_BUCKET_DATA_ARN: data.arn,
  AWS_S3_BUCKET_UPLOADS_ARN: uploads.arn,
};
