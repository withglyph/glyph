import * as k8s from '@pulumi/kubernetes';
import { certificates } from '$aws/acm';
import { defaultBackendService } from '$k8s/infra/default-backend';

new k8s.networking.v1.Ingress('public-alb@infra', {
  metadata: {
    name: 'public-alb',
    namespace: 'infra',
    annotations: {
      'alb.ingress.kubernetes.io/load-balancer-name': 'public-alb',
      'alb.ingress.kubernetes.io/group.name': 'public-alb',
      'alb.ingress.kubernetes.io/scheme': 'internet-facing',
      'alb.ingress.kubernetes.io/listen-ports': JSON.stringify([{ HTTP: 80, HTTPS: 443 }]),
      'alb.ingress.kubernetes.io/security-groups': 'internal, public-web',
      'alb.ingress.kubernetes.io/certificate-arn': certificates.penxle_com.arn,
      'alb.ingress.kubernetes.io/ssl-redirect': '443',
      'alb.ingress.kubernetes.io/healthcheck-path': '/healthz',
      'pulumi.com/skipAwait': 'true',
    },
  },
  spec: {
    ingressClassName: 'alb',
    defaultBackend: {
      service: {
        name: defaultBackendService.metadata.name,
        port: { number: defaultBackendService.spec.ports[0].port },
      },
    },
  },
});
