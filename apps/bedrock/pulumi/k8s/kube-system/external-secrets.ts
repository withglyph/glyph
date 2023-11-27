import * as k8s from '@pulumi/kubernetes';

new k8s.helm.v3.Release('external-secrets', {
  name: 'external-secrets',
  namespace: 'kube-system',

  chart: 'external-secrets',
  repositoryOpts: {
    repo: 'https://charts.external-secrets.io',
  },
});
