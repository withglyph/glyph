import * as k8s from '@pulumi/kubernetes';

new k8s.helm.v3.Release('argo-rollouts', {
  name: 'argo-rollouts',
  namespace: 'kube-system',

  chart: 'argo-rollouts',
  repositoryOpts: {
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
