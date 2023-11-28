import * as k8s from '@pulumi/kubernetes';
import { namespace } from '$k8s/argocd';

new k8s.helm.v3.Release('argo-rollouts', {
  name: 'argo-rollouts',
  namespace: namespace.metadata.name,

  chart: 'argo-rollouts',
  repositoryOpts: {
    repo: 'https://argoproj.github.io/argo-helm',
  },

  values: {
    dashboard: {
      enabled: true,
      service: {
        type: 'NodePort',
      },
      ingress: {
        enabled: true,
        annotations: {
          'alb.ingress.kubernetes.io/scheme': 'internal',
          'alb.ingress.kubernetes.io/listen-ports': JSON.stringify([{ HTTP: 80, HTTPS: 443 }]),
          'alb.ingress.kubernetes.io/security-groups': 'internal',
          'alb.ingress.kubernetes.io/ssl-redirect': '443',
        },
        ingressClassName: 'alb',
        hosts: ['argo-rollouts.pnxl.co'],
      },
    },
  },
});
