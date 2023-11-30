import { bedrockRef } from '@penxle/pulumi';
import * as aws from '@pulumi/aws';

const pkg = aws.s3.getObjectOutput({
  bucket: bedrockRef('AWS_S3_BUCKET_ARTIFACTS_BUCKET'),
  key: 'lambda/prod--github-app.zip',
});

const role = new aws.iam.Role('github-app@lambda', {
  name: 'github-app@lambda',
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: 'lambda.amazonaws.com',
  }),
  managedPolicyArns: [aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole],
});

new aws.iam.RolePolicy('github-app@lambda', {
  role: role.name,

  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: ['ssm:GetParameter'],
        Resource: 'arn:aws:ssm:*:*:parameter/github-app/*',
      },
      {
        Effect: 'Allow',
        Action: ['ecs:RunTask'],
        Resource: ['arn:aws:ecs:*:*:cluster/actions-runner', 'arn:aws:ecs:*:*:task-definition/actions-runner'],
      },
      {
        Effect: 'Allow',
        Action: ['iam:PassRole'],
        Resource: '*',
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
  sourceCodeHash: pkg.metadata.hash,
});

const lambdaUrl = new aws.lambda.FunctionUrl('github-app', {
  functionName: lambda.name,
  authorizationType: 'NONE',
});

export const GITHUB_APP_WEBHOOK_URL = lambdaUrl.functionUrl;
