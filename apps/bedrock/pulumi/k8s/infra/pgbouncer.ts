import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import { namespace } from '$k8s/infra';

const password = new random.RandomPassword('pgbouncer@infra', {
  length: 20,
  special: false,
});

const cm = new k8s.core.v1.ConfigMap('pgbouncer@infra', {
  metadata: {
    name: 'pgbouncer',
    namespace: namespace.metadata.name,
  },
  immutable: false,
  data: {
    'pgbouncer.ini': `
      [databases]
      penxle = host=db.pnxl.co

      [pgbouncer]
      ;; IP address or * which means all IPs
      listen_addr = *
      listen_port = 5432

      ;; any, trust, plain, md5, cert, hba, pam
      auth_type = md5
      auth_file = /conf/userlist.txt

      ;; When server connection is released back to pool:
      ;;   session      - after client disconnects (default)
      ;;   transaction  - after transaction finishes
      ;;   statement    - after statement finishes
      pool_mode = transaction

      ;; t4g.medium max connection = 341
      ;; https://sysadminxpert.com/aws-rds-max-connections-limit/

      ;; Total number of clients that can connect
      max_client_conn = 1000

      ;; Default pool size.  20 is good number when transaction pooling
      ;; is in use, in session pooling it needs to be the number of
      ;; max clients you want to handle at any moment
      default_pool_size = 100

      ;; Minimum number of server connections to keep in pool.
      min_pool_size = 100

      ;; disable, allow, require, verify-ca, verify-full
      ;; spell-checker:disable-next-line
      server_tls_sslmode = disable
    `,
    'userlist.txt': pulumi.interpolate`
      "penxle" "${password.result}"
    `,
  },
});

new k8s.apps.v1.Deployment('pgbouncer@infra', {
  metadata: {
    name: 'pgbouncer',
    namespace: namespace.metadata.name,
  },
  spec: {
    replicas: 2,
    selector: { matchLabels: { app: 'pgbouncer' } },
    template: {
      metadata: { labels: { app: 'pgbouncer' } },
      spec: {
        containers: [
          {
            name: 'pgbouncer',
            image: '721144421085.dkr.ecr.ap-northeast-2.amazonaws.com/pgbouncer:1.21.0',
            resources: {
              requests: { cpu: '2000m' },
              limits: { memory: '500Mi' },
            },
            volumeMounts: [
              {
                name: 'conf',
                mountPath: '/conf',
              },
            ],
          },
        ],
        volumes: [
          {
            name: 'conf',
            configMap: { name: cm.metadata.name },
          },
        ],
      },
    },
  },
});

new k8s.policy.v1.PodDisruptionBudget('pgbouncer@infra', {
  metadata: {
    name: 'pgbouncer',
    namespace: namespace.metadata.name,
  },
  spec: {
    selector: { matchLabels: { app: 'pgbouncer' } },
    maxUnavailable: 1,
  },
});

new k8s.core.v1.Service('pgbouncer@infra', {
  metadata: {
    name: 'pgbouncer',
    namespace: namespace.metadata.name,
    annotations: {
      'service.beta.kubernetes.io/aws-load-balancer-security-groups': 'internal',
      'external-dns.alpha.kubernetes.io/hostname': 'pool.db.pnxl.co',
    },
  },
  spec: {
    type: 'LoadBalancer',
    loadBalancerClass: 'service.k8s.aws/nlb',
    selector: { app: 'pgbouncer' },
    ports: [{ port: 5432 }],
  },
});

export const outputs = {
  K8S_INFRA_PGBOUNCER_PASSWORD: password.result,
};
