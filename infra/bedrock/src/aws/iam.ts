import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { buckets } from '$aws/s3';

const bunnyNet = new aws.iam.User('bunny.net', {
  name: 'bunny.net',
});

const bunnyNetAccessKey = new aws.iam.AccessKey('bunny.net', {
  user: bunnyNet.name,
});

new aws.iam.UserPolicy('bunny.net', {
  user: bunnyNet.name,
  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: ['s3:GetObject'],
        Resource: pulumi.concat(buckets.data.arn, '/*'),
      },
    ],
  },
});

const ecsExecution = new aws.iam.Role('_execution@ecs', {
  name: '_execution@ecs',
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: 'ecs-tasks.amazonaws.com',
  }),
  managedPolicyArns: [
    'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy',
  ],
});

export const outputs = {
  AWS_IAM_USER_BUNNY_NET_NAME: bunnyNet.name,
  AWS_IAM_USER_BUNNY_NET_ACCESS_KEY_ID: bunnyNetAccessKey.id,
  AWS_IAM_USER_BUNNY_NET_SECRET_ACCESS_KEY: bunnyNetAccessKey.secret,

  AWS_IAM_ROLE_ECS_EXECUTION_ARN: ecsExecution.arn,
};
