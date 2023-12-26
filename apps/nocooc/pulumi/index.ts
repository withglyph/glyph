import * as penxle from '@penxle/pulumi/components';
import * as aws from '@pulumi/aws';
import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';

const labels = { app: 'nocooc' };

const image = aws.ecr.getImageOutput({
  repositoryName: 'nocooc',
  imageTag: 'latest',
});

const eip1 = new aws.ec2.Eip('public-nlb@az1', {
  tags: { Name: 'public-nlb@az1' },
});

const eip2 = new aws.ec2.Eip('public-nlb@az2', {
  tags: { Name: 'public-nlb@az2' },
});

const sqs = new aws.sqs.Queue('nocooc', {
  name: 'nocooc',

  visibilityTimeoutSeconds: 600,
  messageRetentionSeconds: 14 * 24 * 60 * 60, // 14 days
});

const role = new aws.iam.Role('nocooc@lambda', {
  name: 'nocooc@lambda',
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: 'lambda.amazonaws.com',
  }),
  managedPolicyArns: [aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole],
});

new aws.iam.RolePolicy('nocooc@lambda', {
  name: 'nocooc@lambda',
  role: role.name,

  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: ['sqs:ReceiveMessage', 'sqs:DeleteMessage', 'sqs:GetQueueAttributes'],
        Resource: [sqs.arn],
      },
    ],
  },
});

const lambda = new aws.lambda.Function('nocooc', {
  name: 'nocooc',
  role: role.arn,

  packageType: 'Image',
  architectures: ['x86_64'],

  memorySize: 256,
  timeout: 60,

  imageUri: pulumi.interpolate`${image.registryId}.dkr.ecr.ap-northeast-2.amazonaws.com/${image.repositoryName}@${image.imageDigest}`,
  sourceCodeHash: image.imageDigest.apply((v) => v.split(':')[1]),

  environment: {
    variables: {
      MODE: 'consumer',
    },
  },
});

new aws.lambda.EventSourceMapping('nocooc', {
  functionName: lambda.name,
  eventSourceArn: sqs.arn,
  batchSize: 1,
});

const serviceAccount = new penxle.IAMServiceAccount('nocooc', {
  metadata: {
    name: 'nocooc',
    namespace: 'prod',
  },
  spec: {
    policy: {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: ['sqs:SendMessage'],
          Resource: [sqs.arn],
        },
      ],
    },
  },
});

new k8s.apps.v1.Deployment('nocooc', {
  metadata: {
    name: 'nocooc',
    namespace: 'prod',
  },
  spec: {
    replicas: 1,
    selector: { matchLabels: labels },
    template: {
      metadata: { labels },
      spec: {
        serviceAccountName: serviceAccount.metadata.name,
        containers: [
          {
            name: 'app',
            image: pulumi.interpolate`${image.registryId}.dkr.ecr.ap-northeast-2.amazonaws.com/${image.repositoryName}@${image.imageDigest}`,
            resources: {
              requests: { cpu: '100m' },
              limits: { memory: '100Mi' },
            },
            env: [
              { name: 'SQS_URL', value: sqs.url },
              { name: 'MODE', value: 'relay' },
            ],
            livenessProbe: {
              tcpSocket: { port: 2266 },
              initialDelaySeconds: 5,
              periodSeconds: 10,
              failureThreshold: 3,
            },
            readinessProbe: {
              tcpSocket: { port: 2266 },
              initialDelaySeconds: 10,
              periodSeconds: 20,
              failureThreshold: 3,
            },
          },
        ],
      },
    },
  },
});

new k8s.core.v1.Service('nocooc', {
  metadata: {
    name: 'nocooc',
    namespace: 'prod',
    annotations: {
      'service.beta.kubernetes.io/aws-load-balancer-name': 'public-nlb',
      'service.beta.kubernetes.io/aws-load-balancer-scheme': 'internet-facing',
      'service.beta.kubernetes.io/aws-load-balancer-security-groups': 'internal, public-nlb',
      'service.beta.kubernetes.io/aws-load-balancer-eip-allocations': pulumi
        .all([eip1.id, eip2.id])
        .apply(([eip1, eip2]) => `${eip1},${eip2}`),
    },
  },
  spec: {
    type: 'LoadBalancer',
    loadBalancerClass: 'service.k8s.aws/nlb',
    selector: labels,
    ports: [{ port: 2266 }],
  },
});
