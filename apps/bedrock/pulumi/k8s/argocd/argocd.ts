import * as k8s from '@pulumi/kubernetes';
import { namespace } from '$k8s/argocd';

new k8s.helm.v3.Release('argocd', {
  name: 'argocd',
  namespace: namespace.metadata.name,

  chart: 'argo-cd',
  repositoryOpts: {
    repo: 'https://argoproj.github.io/argo-helm',
  },

  values: {
    server: {
      service: {
        type: 'NodePort',
      },
      ingress: {
        enabled: true,
        annotations: {
          'alb.ingress.kubernetes.io/scheme': 'internet-facing',
          'alb.ingress.kubernetes.io/listen-ports': JSON.stringify([{ HTTP: 80, HTTPS: 443 }]),
          'alb.ingress.kubernetes.io/security-groups': 'internal, public-web',
          'alb.ingress.kubernetes.io/ssl-redirect': '443',
          'alb.ingress.kubernetes.io/backend-protocol': 'HTTPS',
        },
        ingressClassName: 'alb',
        hosts: ['argocd.pnxl.co'],
      },
      ingressGrpc: {
        enabled: true,
        isAWSALB: true,
      },
    },
    applicationSet: {
      service: {
        type: 'NodePort',
      },
      webhook: {
        ingress: {
          enabled: true,
          annotations: {
            'alb.ingress.kubernetes.io/scheme': 'internet-facing',
            'alb.ingress.kubernetes.io/listen-ports': JSON.stringify([{ HTTP: 80, HTTPS: 443 }]),
            'alb.ingress.kubernetes.io/security-groups': 'internal, public-web',
            'alb.ingress.kubernetes.io/ssl-redirect': '443',
          },
          ingressClassName: 'alb',
          hosts: ['argocd-applicationset.pnxl.co'],
        },
      },
    },
  },
});
