import * as aws from '@pulumi/aws';

const artifacts = new aws.s3.Bucket('artifacts', {
  bucket: 'penxle-artifacts',

  lifecycleRules: [
    {
      enabled: true,
      prefix: 'lambda/',
      expiration: { days: 7 },
    },
  ],
});

const data = new aws.s3.Bucket('data', {
  bucket: 'penxle-data',
});

const uploads = new aws.s3.Bucket('uploads', {
  bucket: 'penxle-uploads',
  corsRules: [
    {
      allowedHeaders: ['*'],
      allowedMethods: ['PUT'],
      allowedOrigins: [
        'https://staging.penxle.com',
        'https://*.penxle.dev',
        'http://127.0.0.1:4000',
      ],
    },
  ],
});

export const buckets = { artifacts, data, uploads };

export const outputs = {
  AWS_S3_BUCKET_ARTIFACTS_BUCKET: artifacts.bucket,
  AWS_S3_BUCKET_DATA_BUCKET: data.bucket,
  AWS_S3_BUCKET_UPLOADS_BUCKET: uploads.bucket,

  AWS_S3_BUCKET_ARTIFACTS_ARN: artifacts.arn,
  AWS_S3_BUCKET_DATA_ARN: data.arn,
  AWS_S3_BUCKET_UPLOADS_ARN: uploads.arn,
};
