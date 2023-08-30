import { bedrockRef } from '@penxle/pulumi';
import * as aws from '@pulumi/aws';

const pkg = aws.s3.getObjectOutput({
  bucket: bedrockRef('AWS_S3_BUCKET_ARTIFACTS_BUCKET'),
  key: 'lambda/github-app-production.zip',
});

const role = new aws.iam.Role('github-app@lambda', {
  name: 'github-app@lambda',
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: 'lambda.amazonaws.com',
  }),
  managedPolicyArns: [aws.iam.ManagedPolicies.AWSLambdaBasicExecutionRole],
});

new aws.iam.RolePolicy('github-app@lambda', {
  role: role.name,

  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: ['ssm:GetParameter'],
        Resource: ['*'],
      },
      {
        Effect: 'Allow',
        Action: ['ecs:RunTask'],
        Resource: [
          'arn:aws:ecs:ap-northeast-2:721144421085:task-definition/actions-runner',
        ],
      },
      {
        Effect: 'Allow',
        Action: ['iam:PassRole'],
        Resource: [
          bedrockRef('AWS_IAM_ROLE_ECS_EXECUTION_ARN'),
          'arn:aws:iam::721144421085:role/actions-runner@ecs',
        ],
      },
    ],
  },
});

const lambda = new aws.lambda.Function('github-app', {
  name: 'github-app',
  role: role.arn,

  runtime: 'nodejs18.x',
  architectures: ['x86_64'],

  memorySize: 512,
  timeout: 900,

  s3Bucket: pkg.bucket,
  s3Key: pkg.key,
  handler: 'index.handler',

  sourceCodeHash: pkg.metadata.Hash,
});

const lambdaUrl = new aws.lambda.FunctionUrl('github-app', {
  functionName: lambda.name,
  authorizationType: 'NONE',
});

export const GITHUB_APP_WEBHOOK_URL = lambdaUrl.functionUrl;
