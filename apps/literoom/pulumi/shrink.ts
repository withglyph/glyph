import { bedrockRef } from '@penxle/pulumi';
import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

const pkg = aws.s3.getObjectOutput({
  bucket: bedrockRef('AWS_S3_BUCKET_ARTIFACTS_BUCKET'),
  key: `lambda/prod--literoom.zip`,
});

const role = new aws.iam.Role('literoom-shrink@lambda', {
  name: 'literoom-shrink@lambda',
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: 'lambda.amazonaws.com',
  }),
  managedPolicyArns: [aws.iam.ManagedPolicies.AWSLambdaBasicExecutionRole],
});

new aws.iam.RolePolicy('literoom-shrink@lambda', {
  name: 'literoom-shrink@lambda',
  role: role.name,

  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: ['s3:GetObject', 's3:PutObject'],
        Resource: pulumi.concat(bedrockRef('AWS_S3_BUCKET_DATA_ARN'), '/*'),
      },
    ],
  },
});

const lambda = new aws.lambda.Function('literoom-shrink', {
  name: 'literoom-shrink',
  role: role.arn,

  runtime: 'nodejs18.x',
  architectures: ['arm64'],

  memorySize: 10_240,
  timeout: 900,

  s3Bucket: pkg.bucket,
  s3Key: pkg.key,
  handler: 'shrink.handler',

  sourceCodeHash: pkg.metadata.Hash,
});

new aws.lambda.Permission('literoom-shrink@lambda', {
  function: lambda.name,
  action: 'lambda:InvokeFunction',
  principal: 's3.amazonaws.com',
});

new aws.s3.BucketNotification('literoom-shrink@lambda', {
  bucket: bedrockRef('AWS_S3_BUCKET_DATA_BUCKET'),
  lambdaFunctions: [
    {
      lambdaFunctionArn: lambda.arn,
      events: ['s3:ObjectCreated:*'],
      filterPrefix: 'images/',
    },
  ],
});
