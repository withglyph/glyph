import * as penxle from '@penxle/pulumi/components';
import * as aws from '@pulumi/aws';
import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';

const labels = { app: 'cashflow' };

const image = aws.ecr.getImageOutput({
  repositoryName: 'cashflow',
  imageTag: 'latest',
});

const eip1 = new aws.ec2.Eip('public-nlb@az1', {
  tags: { Name: 'public-nlb@az1' },
});

const eip2 = new aws.ec2.Eip('public-nlb@az2', {
  tags: { Name: 'public-nlb@az2' },
});

const secret = new penxle.DopplerSecret('cashflow', {
  metadata: {
    name: 'cashflow',
    namespace: 'prod',
  },
  spec: {
    project: 'cashflow',
    config: 'prod',
  },
});

const serviceAccount = new penxle.IAMServiceAccount('cashflow', {
  metadata: {
    name: 'cashflow',
    namespace: 'prod',
  },
  spec: {
    policy: {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: ['dynamodb:PutItem'],
          Resource: ['*'],
        },
      ],
    },
  },
});

new k8s.apps.v1.Deployment('cashflow', {
  metadata: {
    name: 'cashflow',
    namespace: 'prod',
  },
  spec: {
    replicas: 2,
    selector: { matchLabels: labels },
    template: {
      metadata: { labels },
      spec: {
        serviceAccountName: serviceAccount.metadata.name,
        containers: [
          {
            name: 'app',
            image: pulumi.interpolate`${image.registryId}.dkr.ecr.ap-northeast-2.amazonaws.com/${image.repositoryName}@${image.imageDigest}`,
            envFrom: [{ secretRef: { name: secret.metadata.name } }],
            resources: {
              requests: { cpu: '100m' },
              limits: { memory: '100Mi' },
            },
            livenessProbe: {
              tcpSocket: { port: 2266 },
              periodSeconds: 10,
              failureThreshold: 3,
            },
            readinessProbe: {
              tcpSocket: { port: 2266 },
              periodSeconds: 20,
              failureThreshold: 3,
            },
          },
        ],
      },
    },
  },
});

new k8s.policy.v1.PodDisruptionBudget('cashflow', {
  metadata: {
    name: 'cashflow',
    namespace: 'prod',
  },
  spec: {
    selector: { matchLabels: labels },
    minAvailable: '50%',
  },
});

new k8s.core.v1.Service('cashflow', {
  metadata: {
    name: 'cashflow',
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
