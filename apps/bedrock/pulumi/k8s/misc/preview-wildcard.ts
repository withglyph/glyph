import * as k8s from '@pulumi/kubernetes';

new k8s.networking.v1.Ingress('wildcard@preview', {
  metadata: {
    name: 'wildcard',
    namespace: 'preview',
    annotations: {
      'alb.ingress.kubernetes.io/scheme': 'internet-facing',
      'alb.ingress.kubernetes.io/listen-ports': JSON.stringify([{ HTTP: 80, HTTPS: 443 }]),
      'alb.ingress.kubernetes.io/security-groups': 'alb, public-web',
      'alb.ingress.kubernetes.io/ssl-redirect': '443',
      'alb.ingress.kubernetes.io/group.name': 'penxle-preview',
      'pulumi.com/skipAwait': 'true',
    },
  },
  spec: {
    ingressClassName: 'alb',
    rules: [{ host: '*.pnxl.site' }],
  },
});
