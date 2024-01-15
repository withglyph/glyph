import * as k8s from '@pulumi/kubernetes';

new k8s.helm.v3.Chart('external-secrets', {
  chart: 'external-secrets',
  namespace: 'kube-system',
  fetchOpts: {
    repo: 'https://charts.external-secrets.io',
  },
});
