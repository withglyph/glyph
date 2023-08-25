import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { buckets } from '$aws/s3';

const bunnyNet = new aws.iam.User('bunny.net');

const bunnyNetAccessKey = new aws.iam.AccessKey('bunny.net', {
  user: bunnyNet.name,
});

new aws.iam.UserPolicy('bunny.net', {
  user: bunnyNet.id,
  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: ['s3:GetObject'],
        // eslint-disable-next-line unicorn/prefer-spread
        Resource: pulumi.concat(buckets.data.arn, '/*'),
      },
    ],
  },
});

export const outputs = {
  AWS_IAM_BUNNY_NET_ACCESS_KEY_ID: bunnyNetAccessKey.id,
  AWS_IAM_BUNNY_NET_SECRET_ACCESS_KEY: bunnyNetAccessKey.secret,
};
