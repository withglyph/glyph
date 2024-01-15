import * as k8s from '@pulumi/kubernetes';

new k8s.helm.v3.Chart('metrics-server', {
  chart: 'metrics-server',
  namespace: 'kube-system',
  fetchOpts: { repo: 'https://kubernetes-sigs.github.io/metrics-server' },
});
