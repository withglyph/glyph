import * as k8s from '@pulumi/kubernetes';
import { namespace } from '$k8s/infra';
import { tailnet } from '$tailscale/key';

new k8s.apps.v1.Deployment('exit-node-az1@infra', {
  metadata: {
    name: 'exit-node-az1',
    namespace: namespace.metadata.name,
  },
  spec: {
    replicas: 1,
    strategy: { type: 'Recreate' },
    selector: { matchLabels: { app: 'exit-node-az1' } },
    template: {
      metadata: { labels: { app: 'exit-node-az1' } },
      spec: {
        nodeSelector: {
          'topology.kubernetes.io/zone': 'ap-northeast-2a',
        },
        containers: [
          {
            name: 'exit-node-az1',
            image: 'tailscale/tailscale:latest',
            env: [
              { name: 'TS_KUBE_SECRET', value: '' },
              { name: 'TS_AUTHKEY', value: tailnet.authKey },
              { name: 'TS_HOSTNAME', value: 'awsvpc-apne2-az1' },
              { name: 'TS_EXTRA_ARGS', value: '--advertise-exit-node' },
              { name: 'TS_USERSPACE', value: 'false' },
            ],
            resources: {
              requests: { cpu: '100m' },
              limits: { memory: '100Mi' },
            },
            securityContext: {
              capabilities: {
                add: ['NET_ADMIN'],
              },
            },
          },
        ],
      },
    },
  },
});

new k8s.apps.v1.Deployment('exit-node-az2@infra', {
  metadata: {
    name: 'exit-node-az2',
    namespace: namespace.metadata.name,
  },
  spec: {
    replicas: 1,
    strategy: { type: 'Recreate' },
    selector: { matchLabels: { app: 'exit-node-az2' } },
    template: {
      metadata: { labels: { app: 'exit-node-az2' } },
      spec: {
        nodeSelector: {
          'topology.kubernetes.io/zone': 'ap-northeast-2b',
        },
        containers: [
          {
            name: 'exit-node-az2',
            image: 'tailscale/tailscale:latest',
            env: [
              { name: 'TS_KUBE_SECRET', value: '' },
              { name: 'TS_AUTHKEY', value: tailnet.authKey },
              { name: 'TS_HOSTNAME', value: 'awsvpc-apne2-az2' },
              { name: 'TS_EXTRA_ARGS', value: '--advertise-exit-node' },
              { name: 'TS_USERSPACE', value: 'false' },
            ],
            resources: {
              requests: { cpu: '100m' },
              limits: { memory: '100Mi' },
            },
            securityContext: {
              capabilities: {
                add: ['NET_ADMIN'],
              },
            },
          },
        ],
      },
    },
  },
});
