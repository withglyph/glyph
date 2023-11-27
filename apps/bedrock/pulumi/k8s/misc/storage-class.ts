import * as k8s from '@pulumi/kubernetes';

new k8s.storage.v1.StorageClass('gp3', {
  metadata: {
    name: 'gp3',
  },

  provisioner: 'ebs.csi.aws.com',
  volumeBindingMode: 'WaitForFirstConsumer',

  parameters: {
    type: 'gp3',
  },
});
