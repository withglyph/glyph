import * as k8s from '@pulumi/kubernetes';
import { namespace } from '$k8s/infra';

const cm = new k8s.core.v1.ConfigMap('default-backend@infra', {
  metadata: {
    name: 'default-backend',
    namespace: namespace.metadata.name,
  },
  data: {
    'nginx.conf': `
      events {}
      http {
        server {
          listen 80 default;

          location / {
            return 404;
          }

          location /healthz {
            return 200;
          }
        }
      }
    `,
  },
});

new k8s.apps.v1.Deployment('default-backend@infra', {
  metadata: {
    name: 'default-backend',
    namespace: namespace.metadata.name,
  },
  spec: {
    replicas: 1,
    selector: { matchLabels: { app: 'default-backend' } },
    template: {
      metadata: { labels: { app: 'default-backend' } },
      spec: {
        containers: [
          {
            name: 'nginx',
            image: 'nginx:latest',
            resources: {
              requests: { cpu: '100m' },
              limits: { memory: '100Mi' },
            },
            volumeMounts: [
              {
                name: 'conf',
                mountPath: '/etc/nginx/nginx.conf',
                subPath: 'nginx.conf',
              },
            ],
          },
        ],
        volumes: [
          {
            name: 'conf',
            configMap: { name: cm.metadata.name },
          },
        ],
      },
    },
  },
});

export const defaultBackendService = new k8s.core.v1.Service('default-backend@infra', {
  metadata: {
    name: 'default-backend',
    namespace: namespace.metadata.name,
  },
  spec: {
    type: 'NodePort',
    selector: { app: 'default-backend' },
    ports: [{ port: 80 }],
  },
});
