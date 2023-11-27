import * as k8s from '@pulumi/kubernetes';
import { namespace } from '$k8s/infra';

const cm = new k8s.core.v1.ConfigMap('mixpanel-proxy@infra', {
  metadata: {
    name: 'mixpanel-proxy',
    namespace: namespace.metadata.name,
  },
  data: {
    'nginx.conf': `
      events {}
      http {
          server {
              listen 80 default;
      
              location /lib.min.js {
                  proxy_set_header X-Real-IP $http_x_forwarded_for;
                  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                  proxy_set_header X-Forwarded-Host $server_name;
                  proxy_pass https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js;
              }
      
              location /lib.js {
                  proxy_set_header X-Real-IP $http_x_forwarded_for;
                  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                  proxy_set_header X-Forwarded-Host $server_name;
                  proxy_pass https://cdn.mxpnl.com/libs/mixpanel-2-latest.js;
              }
      
              location /decide {
                  proxy_set_header Host decide.mixpanel.com;
                  proxy_set_header X-Real-IP $http_x_forwarded_for;
                  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                  proxy_set_header X-Forwarded-Host $server_name;
                  proxy_pass https://decide.mixpanel.com/decide;
              }
      
              location / {
                  proxy_set_header Host api.mixpanel.com;
                  proxy_set_header X-Real-IP $http_x_forwarded_for;
                  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                  proxy_set_header X-Forwarded-Host $server_name;
                  proxy_pass https://api.mixpanel.com;
              }
          }
      }
    `,
  },
});

new k8s.apps.v1.Deployment('mixpanel-proxy@infra', {
  metadata: {
    name: 'mixpanel-proxy',
    namespace: namespace.metadata.name,
  },
  spec: {
    replicas: 1,
    selector: { matchLabels: { app: 'mixpanel-proxy' } },
    template: {
      metadata: { labels: { app: 'mixpanel-proxy' } },
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
                name: 'mixpanel-proxy',
                mountPath: '/etc/nginx/nginx.conf',
                subPath: 'nginx.conf',
              },
            ],
          },
        ],
        volumes: [
          {
            name: 'mixpanel-proxy',
            configMap: { name: cm.metadata.name },
          },
        ],
      },
    },
  },
});

const service = new k8s.core.v1.Service('mixpanel-proxy@infra', {
  metadata: {
    name: 'mixpanel-proxy',
    namespace: namespace.metadata.name,
  },
  spec: {
    clusterIP: 'None',
    selector: { app: 'mixpanel-proxy' },
    ports: [{ port: 80 }],
  },
});

new k8s.networking.v1.Ingress('mixpanel-proxy@infra', {
  metadata: {
    name: 'mixpanel-proxy',
    namespace: namespace.metadata.name,
    annotations: {
      'alb.ingress.kubernetes.io/scheme': 'internet-facing',
      'alb.ingress.kubernetes.io/listen-ports': JSON.stringify([{ HTTP: 80, HTTPS: 443 }]),
      'alb.ingress.kubernetes.io/security-groups': 'alb, public-web',
      'alb.ingress.kubernetes.io/ssl-redirect': '443',
    },
  },
  spec: {
    ingressClassName: 'alb',
    rules: [
      {
        host: 'x.pnxl.co',
        http: {
          paths: [
            {
              path: '/',
              pathType: 'Prefix',
              backend: {
                service: {
                  name: service.metadata.name,
                  port: { number: service.spec.ports[0].port },
                },
              },
            },
          ],
        },
      },
    ],
  },
});
