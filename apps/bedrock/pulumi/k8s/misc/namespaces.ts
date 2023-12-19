import * as k8s from '@pulumi/kubernetes';

new k8s.core.v1.Namespace('preview', {
  metadata: {
    name: 'preview',
  },
});

new k8s.core.v1.Namespace('staging', {
  metadata: {
    name: 'staging',
  },
});

new k8s.core.v1.Namespace('prod', {
  metadata: {
    name: 'prod',
  },
});
