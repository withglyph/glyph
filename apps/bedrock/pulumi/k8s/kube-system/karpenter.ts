import * as aws from '@pulumi/aws';
import * as k8s from '@pulumi/kubernetes';
import { cluster, fargate, oidcProvider } from '$aws/eks';
import { securityGroups, subnets } from '$aws/vpc';

const karpenterRole = new aws.iam.Role('karpenter@eks', {
  name: 'karpenter@eks',
  assumeRolePolicy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { Federated: oidcProvider.arn },
        Action: 'sts:AssumeRoleWithWebIdentity',
        Condition: oidcProvider.url.apply((url) => ({
          StringEquals: {
            [`${url}:aud`]: 'sts.amazonaws.com',
            [`${url}:sub`]: 'system:serviceaccount:kube-system:karpenter',
          },
        })),
      },
    ],
  },
});

const nodeRole = new aws.iam.Role('node@eks', {
  name: 'node@eks',
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: 'ec2.amazonaws.com',
  }),
  managedPolicyArns: [
    aws.iam.ManagedPolicy.AmazonEKSWorkerNodePolicy,
    aws.iam.ManagedPolicy.AmazonEC2ContainerRegistryReadOnly,
    aws.iam.ManagedPolicy.AmazonEKS_CNI_Policy,
    aws.iam.ManagedPolicy.AmazonSSMManagedInstanceCore,
    // spell-checker:disable-next-line
    aws.iam.ManagedPolicy.AmazonEBSCSIDriverPolicy,
  ],
});

new aws.iam.RolePolicy('karpenter@eks', {
  role: karpenterRole.name,
  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: [
          'ssm:GetParameter',
          'ec2:DescribeImages',
          'ec2:RunInstances',
          'ec2:DescribeSubnets',
          'ec2:DescribeSecurityGroups',
          'ec2:DescribeLaunchTemplates',
          'ec2:DescribeInstances',
          'ec2:DescribeInstanceTypes',
          'ec2:DescribeInstanceTypeOfferings',
          'ec2:DescribeAvailabilityZones',
          'ec2:DeleteLaunchTemplate',
          'ec2:CreateTags',
          'ec2:CreateLaunchTemplate',
          'ec2:CreateFleet',
          'ec2:DescribeSpotPriceHistory',
          'pricing:GetProducts',
        ],
        Effect: 'Allow',
        Resource: '*',
      },
      {
        Action: 'ec2:TerminateInstances',
        Effect: 'Allow',
        Resource: '*',
      },
      {
        Effect: 'Allow',
        Action: 'iam:PassRole',
        Resource: '*',
      },
      {
        Effect: 'Allow',
        Action: 'eks:DescribeCluster',
        Resource: '*',
      },
      {
        Effect: 'Allow',
        Action: ['iam:CreateInstanceProfile'],
        Resource: '*',
      },
      {
        Effect: 'Allow',
        Action: ['iam:TagInstanceProfile'],
        Resource: '*',
      },
      {
        Effect: 'Allow',
        Action: ['iam:AddRoleToInstanceProfile', 'iam:RemoveRoleFromInstanceProfile', 'iam:DeleteInstanceProfile'],
        Resource: '*',
      },
      {
        Effect: 'Allow',
        Action: 'iam:GetInstanceProfile',
        Resource: '*',
      },
    ],
  },
});

const serviceAccount = new k8s.core.v1.ServiceAccount('karpenter', {
  metadata: {
    name: 'karpenter',
    namespace: 'kube-system',
    annotations: {
      'eks.amazonaws.com/role-arn': karpenterRole.arn,
    },
  },
});

new k8s.helm.v3.Release(
  'karpenter',
  {
    name: 'karpenter',
    namespace: 'kube-system',

    chart: 'oci://public.ecr.aws/karpenter/karpenter',
    version: 'v0.32.2',

    values: {
      serviceAccount: {
        create: false,
        name: serviceAccount.metadata.name,
      },

      podLabels: {
        app: 'karpenter',
      },

      settings: {
        clusterName: cluster.name,
        // interruptionQueue: cluster.name,

        featureGates: {
          drift: true,
        },
      },
    },
  },
  { dependsOn: fargate },
);

const nodeClass = new k8s.apiextensions.CustomResource('default', {
  apiVersion: 'karpenter.k8s.aws/v1beta1',
  kind: 'EC2NodeClass',

  metadata: {
    name: 'default',
  },

  spec: {
    amiFamily: 'AL2',
    role: nodeRole.name,

    subnetSelectorTerms: [{ id: subnets.private.az1.id }, { id: subnets.private.az2.id }],
    securityGroupSelectorTerms: [{ id: securityGroups.internal.id }],

    blockDeviceMappings: [
      {
        deviceName: '/dev/xvda',
        ebs: {
          volumeSize: '20Gi',
          volumeType: 'gp3',
          iops: 3000,
          throughput: 150,
        },
      },
    ],

    metadataOptions: {
      httpEndpoint: 'enabled',
      httpProtocolIPv6: 'disabled',
      httpPutResponseHopLimit: 2,
      httpTokens: 'required',
    },

    tags: {
      Name: 'eks-node',
    },
  },
});

new k8s.apiextensions.CustomResource('default', {
  apiVersion: 'karpenter.sh/v1beta1',
  kind: 'NodePool',

  metadata: {
    name: 'default',
  },

  spec: {
    template: {
      spec: {
        nodeClassRef: { name: nodeClass.metadata.name },
        requirements: [
          { key: 'kubernetes.io/arch', operator: 'In', values: ['amd64'] },
          { key: 'kubernetes.io/os', operator: 'In', values: ['linux'] },
          { key: 'karpenter.sh/capacity-type', operator: 'In', values: ['spot'] },
          { key: 'karpenter.k8s.aws/instance-category', operator: 'In', values: ['c', 'm', 'r'] },
          { key: 'karpenter.k8s.aws/instance-generation', operator: 'Gt', values: ['5'] },
        ],
      },
    },

    limits: {
      cpu: 1000,
      memory: '1000Gi',
    },

    disruption: {
      consolidationPolicy: 'WhenUnderutilized',
      expireAfter: '720h', // 30 * 24h
    },
  },
});
