import * as penxle from '@penxle/pulumi/components';
import * as k8s from '@pulumi/kubernetes';
import { namespace } from '$k8s/monitoring';

new k8s.helm.v3.Release('datadog-operator', {
  name: 'datadog-operator',
  namespace: namespace.metadata.name,

  chart: 'datadog-operator',
  repositoryOpts: { repo: 'https://helm.datadoghq.com' },
});

const secret = new penxle.DopplerSecret('datadog', {
  metadata: {
    name: 'datadog',
    namespace: namespace.metadata.name,
  },

  spec: {
    project: 'datadog',
    config: 'prod',
  },
});

new k8s.apiextensions.CustomResource('datadog', {
  apiVersion: 'datadoghq.com/v2alpha1',
  kind: 'DatadogAgent',
  metadata: {
    name: 'datadog',
    namespace: namespace.metadata.name,
  },
  spec: {
    global: {
      site: 'ap1.datadoghq.com',
      clusterName: 'eks',
      credentials: {
        appSecret: {
          secretName: secret.metadata.name,
          keyName: 'APP_KEY',
        },
        apiSecret: {
          secretName: secret.metadata.name,
          keyName: 'API_KEY',
        },
      },
    },
    features: {
      apm: {
        enabled: true,
      },
      clusterChecks: {
        useClusterChecksRunners: true,
      },
      prometheusScrape: {
        enabled: true,
      },
      otlp: {
        receiver: {
          protocols: {
            grpc: {
              enabled: true,
            },
          },
        },
      },
    },
  },
});
