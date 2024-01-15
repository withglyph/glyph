import * as k8s from '@pulumi/kubernetes';

new k8s.helm.v3.Chart('argo-rollouts', {
  chart: 'argo-rollouts',
  namespace: 'kube-system',
  fetchOpts: {
    repo: 'https://argoproj.github.io/argo-helm',
  },

  values: {
    notifications: {
      secret: {
        create: true,
      },
    },
  },
});
