import { bedrockRef } from '@penxle/pulumi';
import * as aws from '@pulumi/aws';
import * as awsnative from '@pulumi/aws-native';
import * as pulumi from '@pulumi/pulumi';

const pkg = aws.s3.getObjectOutput({
  bucket: bedrockRef('AWS_S3_BUCKET_ARTIFACTS_BUCKET'),
  key: `lambda/prod--literoom.zip`,
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

  runtime: 'nodejs18.x',
  architectures: ['arm64'],

  memorySize: 10_240,
  timeout: 900,

  s3Bucket: pkg.bucket,
  s3Key: pkg.key,
  handler: 'index.handler',
  sourceCodeHash: pkg.metadata.hash,

  layers: ['arn:aws:lambda:ap-northeast-2:464622532012:layer:Datadog-Extension-ARM:48'],

  environment: {
    variables: {
      DD_SITE: 'ap1.datadoghq.com',
      DD_API_KEY_SECRET_ARN: 'arn:aws:secretsmanager:ap-northeast-2:721144421085:secret:datadog/api-key-cWrlAs',

      DD_SERVICE: 'literoom',
      DD_ENV: 'prod',
      DD_VERSION: 'latest',

      DD_CAPTURE_LAMBDA_PAYLOAD: 'true',
      DD_LOGS_INJECTION: 'true',
      DD_PROFILING_ENABLED: 'true',
      DD_SERVERLESS_LOGS_ENABLED: 'true',
      DD_TRACE_ENABLED: 'true',
    },
  },

  tracingConfig: {
    mode: 'Active',
  },
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
      {
        Effect: 'Allow',
        Action: ['secretsmanager:GetSecretValue'],
        Resource: ['arn:aws:secretsmanager:ap-northeast-2:721144421085:secret:datadog/*'],
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

export const IMAGES_ACCESS_POINT_ALIAS = objectLambdaAccessPoint.alias.value;
