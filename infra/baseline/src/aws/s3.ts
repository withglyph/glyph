import * as aws from '@pulumi/aws';

const artifacts = new aws.s3.Bucket('artifacts', {
  bucket: 'penxle-artifacts',
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

// new aws.s3control.ObjectLambdaAccessPoint('penxle-data', {
//   name: 'penxle-images',
//   configuration: {
//     supportingAccessPoint: new aws.s3.AccessPoint('penxle-data', {
//       name: 'penxle-data',
//       bucket: data.id,
//     }).id,
//     transformationConfigurations: [
//       {
//         actions: ['GetObject'],
//         contentTransformation: {
//           awsLambda: {
//             functionArn: '',
//           },
//         },
//       },
//     ],
//   },
// });

export const outputs = {};
