import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import { mq } from '$aws/mq';
import { namespace } from '$k8s/monitoring';

const password = new random.RandomPassword('rabbitmq@k8s/monitoring', {
  length: 20,
  special: false,
});

new k8s.core.v1.Service('rabbitmq', {
  metadata: {
    name: 'rabbitmq',
    namespace: namespace.metadata.name,
    labels: {
      'tags.datadoghq.com/env': 'prod',
      'tags.datadoghq.com/service': 'withglyph',
    },
    annotations: {
      'ad.datadoghq.com/service.checks': pulumi
        .all([mq.broker.instances[0].consoleUrl, password.result])
        .apply(([url, password]) =>
          JSON.stringify({
            rabbitmq: {
              instances: [
                {
                  rabbitmq_api_url: `${url.replaceAll('https://', `https://datadog:${password}@`)}/api/`,
                },
              ],
            },
          }),
        ),
    },
  },
  spec: {
    clusterIP: 'None',
  },
});

export const outputs = {
  K8S_MONITORING_RABBITMQ_PASSWORD: password.result,
};
