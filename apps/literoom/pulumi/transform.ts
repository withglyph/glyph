import { bedrockRef } from '@penxle/pulumi';
import * as aws from '@pulumi/aws';
import * as awsnative from '@pulumi/aws-native';
import * as pulumi from '@pulumi/pulumi';

const pkg = aws.s3.getObjectOutput({
  bucket: bedrockRef('AWS_S3_BUCKET_ARTIFACTS_BUCKET'),
  key: `lambda/prod--literoom.zip`,
});

const role = new aws.iam.Role('literoom-transform@lambda', {
  name: 'literoom-transform@lambda',
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: 'lambda.amazonaws.com',
  }),
  managedPolicyArns: [aws.iam.ManagedPolicies.AWSLambdaBasicExecutionRole],
});

const lambda = new aws.lambda.Function('literoom-transform', {
  name: 'literoom-transform',
  role: role.arn,

  runtime: 'nodejs18.x',
  architectures: ['x86_64'],

  memorySize: 10_240,
  timeout: 900,

  s3Bucket: pkg.bucket,
  s3Key: pkg.key,
  handler: 'transform.handler',

  sourceCodeHash: pkg.metadata.Hash,
});

const accessPoint = new aws.s3.AccessPoint('data', {
  name: 'penxle-data',
  bucket: bedrockRef('AWS_S3_BUCKET_DATA_BUCKET'),
});

const objectLambdaAccessPoint = new awsnative.s3objectlambda.AccessPoint(
  'penxle-images',
  {
    name: 'penxle-images',
    objectLambdaConfiguration: {
      supportingAccessPoint: accessPoint.arn,
      transformationConfigurations: [
        {
          actions: ['GetObject'],
          contentTransformation: {
            awsLambda: {
              functionArn: lambda.arn,
            },
          },
        },
      ],
    },
  },
);

new aws.iam.RolePolicy('literoom-transform@lambda', {
  name: 'literoom-transform@lambda',
  role: role.name,

  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: ['s3-object-lambda:WriteGetObjectResponse'],
        Resource: [objectLambdaAccessPoint.arn],
      },
    ],
  },
});

new aws.iam.UserPolicy('bunny.net', {
  user: bedrockRef('AWS_IAM_USER_BUNNY_NET_NAME'),
  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: ['s3:GetObject'],
        Resource: pulumi.concat(accessPoint.arn, '/*'),
      },
      {
        Effect: 'Allow',
        Action: ['s3-object-lambda:GetObject'],
        Resource: objectLambdaAccessPoint.arn,
      },
      {
        Effect: 'Allow',
        Action: ['lambda:InvokeFunction'],
        Resource: [lambda.arn],
      },
    ],
  },
});

export const outputs = {
  IMAGES_ACCESS_POINT_ALIAS: objectLambdaAccessPoint.alias.value,
};
