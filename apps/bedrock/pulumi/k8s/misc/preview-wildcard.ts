import * as k8s from '@pulumi/kubernetes';

new k8s.networking.v1.Ingress('wildcard@preview', {
  metadata: {
    name: 'wildcard',
    namespace: 'preview',
    annotations: {
      'alb.ingress.kubernetes.io/group.name': 'public-alb',
      'alb.ingress.kubernetes.io/listen-ports': JSON.stringify([{ HTTPS: 443 }]),
      'pulumi.com/skipAwait': 'true',
    },
  },
  spec: {
    ingressClassName: 'alb',
    rules: [{ host: '*.effit.dev' }],
  },
});
