import * as k8s from '@pulumi/kubernetes';
import { namespace } from '$k8s/argocd';

new k8s.apiextensions.CustomResource('applicationset', {
  apiVersion: 'argoproj.io/v1alpha1',
  kind: 'ApplicationSet',

  metadata: {
    name: 'applicationset',
    namespace: namespace.metadata.name,
  },

  spec: {
    goTemplate: true,
    goTemplateOptions: ['missingkey=error'],
    generators: [
      {
        git: {
          repoURL: 'https://github.com/penxle/manifests.git',
          revision: 'HEAD',
          directories: [{ path: '*' }],
        },
      },
    ],
    template: {
      metadata: {
        name: '{{.path.basename}}',
      },
      spec: {
        project: 'default',
        source: {
          repoURL: 'https://github.com/penxle/manifests.git',
          targetRevision: 'HEAD',
          path: '{{.path.path}}',
          directory: {
            recurse: true,
          },
        },
        destination: {
          server: 'https://kubernetes.default.svc',
          namespace: '{{.path.basename}}',
        },
        syncPolicy: {
          automated: {
            prune: true,
            selfHeal: true,
          },
          syncOptions: ['CreateNamespace=true'],
        },
      },
    },
  },
});
