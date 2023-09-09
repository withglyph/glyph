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

const table = new aws.dynamodb.Table('literoom-shrink', {
  name: 'literoom-shrink',

  billingMode: 'PAY_PER_REQUEST',

  hashKey: 'key',
  rangeKey: 'size',

  attributes: [
    { name: 'key', type: 'S' },
    { name: 'size', type: 'N' },
  ],

  ttl: {
    enabled: true,
    attributeName: 'ttl',
  },
});

new aws.iam.RolePolicy('literoom-shrink@lambda', {
  name: 'literoom-shrink@lambda',
  role: role.name,

  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: ['s3:GetObject'],
        Resource: pulumi.concat(bedrockRef('AWS_S3_BUCKET_DATA_ARN'), '/*'),
      },
      {
        Effect: 'Allow',
        Action: ['s3:PutObject'],
        Resource: pulumi.concat(bedrockRef('AWS_S3_BUCKET_CACHES_ARN'), '/*'),
      },
      {
        Effect: 'Allow',
        Action: ['dynamodb:GetItem', 'dynamodb:PutItem', 'dynamodb:DeleteItem'],
        Resource: table.arn,
      },
    ],
  },
});

export { lambda };
