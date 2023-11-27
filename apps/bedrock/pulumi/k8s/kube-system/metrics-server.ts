import * as k8s from '@pulumi/kubernetes';

new k8s.helm.v3.Release('metrics-server', {
  name: 'metrics-server',
  namespace: 'kube-system',

  chart: 'metrics-server',
  repositoryOpts: { repo: 'https://kubernetes-sigs.github.io/metrics-server' },
});
