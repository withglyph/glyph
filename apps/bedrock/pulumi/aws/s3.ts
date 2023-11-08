import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

const artifacts = new aws.s3.Bucket('artifacts', {
  bucket: 'penxle-artifacts',

  lifecycleRules: [
    { enabled: true, prefix: 'actions-cache/', expiration: { days: 7 } },
    { enabled: true, prefix: 'lambda/', expiration: { days: 7 } },
  ],
});

new aws.s3.BucketPolicy('artifacts', {
  bucket: artifacts.bucket,
  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { Service: 'billingreports.amazonaws.com' },
        Action: ['s3:GetBucketAcl', 's3:GetBucketPolicy', 's3:PutObject'],
        Resource: [artifacts.arn, pulumi.interpolate`${artifacts.arn}/*`],
      },
    ],
  },
});

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
      allowedOrigins: ['https://staging.penxle.com', 'https://*.pnxl.site', 'http://localhost:4000'],
    },
  ],
});

export const buckets = { artifacts, caches, data, uploads };

export const outputs = {
  AWS_S3_BUCKET_ARTIFACTS_BUCKET: artifacts.bucket,
  AWS_S3_BUCKET_CACHES_BUCKET: caches.bucket,
  AWS_S3_BUCKET_DATA_BUCKET: data.bucket,
  AWS_S3_BUCKET_UPLOADS_BUCKET: uploads.bucket,

  AWS_S3_BUCKET_ARTIFACTS_ARN: artifacts.arn,
  AWS_S3_BUCKET_CACHES_ARN: caches.arn,
  AWS_S3_BUCKET_DATA_ARN: data.arn,
  AWS_S3_BUCKET_UPLOADS_ARN: uploads.arn,
};
