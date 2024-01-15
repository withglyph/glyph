import * as aws from '@pulumi/aws';
import * as k8s from '@pulumi/kubernetes';
import { oidcProvider } from '$aws/eks';

const role = new aws.iam.Role('external-dns@eks', {
  name: 'external-dns@eks',
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
            [`${url}:sub`]: 'system:serviceaccount:kube-system:external-dns',
          },
        })),
      },
    ],
  },
});

new aws.iam.RolePolicy('external-dns@eks', {
  role: role.name,
  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: ['route53:ChangeResourceRecordSets'],
        Resource: ['arn:aws:route53:::hostedzone/*'],
      },
      {
        Effect: 'Allow',
        Action: ['route53:ListHostedZones', 'route53:ListResourceRecordSets', 'route53:ListTagsForResource'],
        Resource: ['*'],
      },
    ],
  },
});

const serviceAccount = new k8s.core.v1.ServiceAccount('external-dns', {
  metadata: {
    name: 'external-dns',
    namespace: 'kube-system',
    annotations: {
      'eks.amazonaws.com/role-arn': role.arn,
    },
  },
});

new k8s.helm.v3.Chart('external-dns', {
  chart: 'external-dns',
  namespace: 'kube-system',
  fetchOpts: { repo: 'https://kubernetes-sigs.github.io/external-dns' },

  values: {
    serviceAccount: {
      create: false,
      name: serviceAccount.metadata.name,
    },

    provider: 'aws',
    policy: 'sync',

    interval: '5m',
    triggerLoopOnEvent: true,
    sources: ['ingress', 'service'],

    txtOwnerId: 'eks',
    txtPrefix: 'ed.',

    extraArgs: ['--aws-zones-cache-duration=1h'],
  },
});
