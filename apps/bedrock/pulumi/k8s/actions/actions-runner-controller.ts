import * as penxle from '@penxle/pulumi/components';
import * as k8s from '@pulumi/kubernetes';

const secret = new penxle.DopplerSecret('actions-runner', {
  metadata: {
    name: 'actions-runner',
    namespace: 'actions',
  },
  spec: {
    project: 'actions-runner',
    config: 'prod',
    transformer: 'lower-snake',
  },
});

new k8s.helm.v3.Chart('actions-runner-controller', {
  chart: 'oci://ghcr.io/actions/actions-runner-controller-charts/gha-runner-scale-set-controller',
  namespace: 'actions',
});

new k8s.helm.v3.Chart('actions-runner', {
  chart: 'oci://ghcr.io/actions/actions-runner-controller-charts/gha-runner-scale-set',
  namespace: 'actions',

  values: {
    runnerScaleSetName: 'eks',

    githubConfigUrl: 'https://github.com/withglyph',
    githubConfigSecret: secret.metadata.name,

    controllerServiceAccount: {
      name: 'actions-runner-controller-gha-rs-controller',
      namespace: 'actions',
    },

    containerMode: {
      // spell-checker:disable-next-line
      type: 'dind',
    },

    template: {
      metadata: {
        annotations: {
          'karpenter.sh/do-not-evict': 'true',
        },
      },
      spec: {
        containers: [
          {
            name: 'runner',
            image: '721144421085.dkr.ecr.ap-northeast-2.amazonaws.com/actions-runner:latest',
            command: ['/home/runner/run.sh'],
            resources: {
              requests: { cpu: '16000m' },
              limits: { memory: '32Gi' },
            },
          },
        ],
      },
    },
  },
});
