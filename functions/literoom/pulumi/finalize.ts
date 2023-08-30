import { bedrockRef } from '@penxle/pulumi';
import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

const pkg = aws.s3.getObjectOutput({
  bucket: bedrockRef('AWS_S3_BUCKET_ARTIFACTS_BUCKET'),
  key: 'lambda/literoom-finalize-main.zip',
});

const role = new aws.iam.Role('literoom-finalize@lambda', {
  name: 'literoom-finalize@lambda',
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: 'lambda.amazonaws.com',
  }),
  managedPolicyArns: [aws.iam.ManagedPolicies.AWSLambdaBasicExecutionRole],
});

new aws.iam.RolePolicy('literoom-finalize@lambda', {
  name: 'literoom-finalize@lambda',
  role: role.name,

  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: ['s3:GetObject', 's3:DeleteObject'],
        Resource: [
          pulumi.concat(bedrockRef('AWS_S3_BUCKET_UPLOADS_ARN'), '/*'),
        ],
      },
      {
        Effect: 'Allow',
        Action: ['s3:PutObject'],
        Resource: [pulumi.concat(bedrockRef('AWS_S3_BUCKET_DATA_ARN'), '/*')],
      },
    ],
  },
});

const lambda = new aws.lambda.Function(`literoom-finalize`, {
  name: 'literoom-finalize',
  role: role.arn,

  runtime: 'nodejs18.x',
  architectures: ['x86_64'],

  memorySize: 10_240,
  timeout: 900,

  s3Bucket: pkg.bucket,
  s3Key: pkg.key,
  handler: 'index.handler',

  sourceCodeHash: pkg.metadata.Hash,
});

new aws.lambda.Permission('literoom-finalize', {
  function: lambda.name,
  action: 'lambda:InvokeFunction',
  principal: 's3.amazonaws.com',
});

new aws.s3.BucketNotification('literoom-finalize@lambda', {
  bucket: bedrockRef('AWS_S3_BUCKET_UPLOADS_BUCKET'),
  lambdaFunctions: [
    {
      lambdaFunctionArn: lambda.arn,
      events: ['s3:ObjectCreated:*'],
      filterPrefix: 'images/',
    },
  ],
});

export const outputs = {};
