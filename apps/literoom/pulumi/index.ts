import { bedrockRef } from '@penxle/pulumi';
import * as aws from '@pulumi/aws';
import * as awsnative from '@pulumi/aws-native';
import * as pulumi from '@pulumi/pulumi';

const image = aws.ecr.getImageOutput({
  repositoryName: 'literoom',
  imageTag: 'latest',
});

const role = new aws.iam.Role('literoom@lambda', {
  name: 'literoom@lambda',
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: 'lambda.amazonaws.com',
  }),
  managedPolicyArns: [aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole],
});

const lambda = new aws.lambda.Function('literoom', {
  name: 'literoom',
  role: role.arn,

  packageType: 'Image',
  architectures: ['x86_64'],

  memorySize: 10_240,
  timeout: 900,

  imageUri: pulumi.interpolate`${image.registryId}.dkr.ecr.ap-northeast-2.amazonaws.com/${image.repositoryName}:latest`,
  sourceCodeHash: image.imageDigest.apply((v) => v.split(':')[1]),
});

new aws.lambda.Permission('literoom', {
  function: lambda.name,
  principal: 'cloudfront.amazonaws.com',
  action: 'lambda:InvokeFunction',
});

const accessPoint = new aws.s3.AccessPoint('data', {
  name: 'penxle-data',
  bucket: bedrockRef('AWS_S3_BUCKET_DATA_BUCKET'),
});

new aws.s3control.AccessPointPolicy('penxle-data', {
  accessPointArn: accessPoint.arn,
  policy: accessPoint.arn.apply((v) =>
    JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { Service: 'cloudfront.amazonaws.com' },
          Action: 's3:*',
          Resource: [v, `${v}/object/*`],
        },
      ],
    }),
  ),
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
  { replaceOnChanges: ['objectLambdaConfiguration'] },
);

new aws.s3control.ObjectLambdaAccessPointPolicy('penxle-images', {
  name: 'penxle-images',
  policy: objectLambdaAccessPoint.arn.apply((v) =>
    JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { Service: 'cloudfront.amazonaws.com' },
          Action: 's3-object-lambda:Get*',
          Resource: v,
        },
      ],
    }),
  ),
});

new aws.iam.RolePolicy('literoom@lambda', {
  name: 'literoom@lambda',
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

export const IMAGES_ACCESS_POINT_ALIAS = objectLambdaAccessPoint.alias.value;
