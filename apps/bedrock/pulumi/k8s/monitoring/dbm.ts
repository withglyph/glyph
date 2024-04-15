import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import { rds } from '$aws/rds';
import { namespace } from '$k8s/monitoring';

const password = new random.RandomPassword('dbm@k8s/monitoring', {
  length: 20,
});

new k8s.core.v1.Service('dbm', {
  metadata: {
    name: 'dbm',
    namespace: namespace.metadata.name,
    labels: {
      'tags.datadoghq.com/env': 'prod',
      'tags.datadoghq.com/service': 'withglyph',
    },
    annotations: {
      'ad.datadoghq.com/service.checks': pulumi
        .all([rds.instance.endpoint, password.result])
        .apply(([host, password]) =>
          JSON.stringify({
            postgres: {
              instances: [
                {
                  dbm: true,
                  host,
                  port: 5432,
                  username: 'datadog',
                  password,
                  // spell-checker:disable
                  dbname: 'penxle',
                  dbstrict: true,
                  // spell-checker:enable
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
  K8S_MONITORING_DBM_PASSWORD: password.result,
};
