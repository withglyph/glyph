import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';

type DopplerSecretArgs = {
  metadata: {
    name: pulumi.Input<string>;
    namespace: pulumi.Input<string>;
  };
  spec: {
    project: pulumi.Input<string>;
    config: pulumi.Input<string>;
    transformer?: pulumi.Input<string>;
  };
};

type DopplerSecretOutputMetadata = {
  name: string;
  namespace: string;
};

export class DopplerSecret extends pulumi.ComponentResource {
  public readonly metadata: pulumi.Output<DopplerSecretOutputMetadata>;

  constructor(name: string, args: DopplerSecretArgs, opts?: pulumi.ComponentResourceOptions) {
    super('penxle:index:DopplerSecret', name, {}, opts);

    const store = new k8s.apiextensions.CustomResource(
      name,
      {
        apiVersion: 'external-secrets.io/v1beta1',
        kind: 'ClusterSecretStore',

        metadata: {
          name: pulumi.interpolate`${args.metadata.name}-${args.metadata.namespace}`,
        },

        spec: {
          provider: {
            doppler: {
              auth: {
                secretRef: {
                  dopplerToken: {
                    name: 'doppler-token',
                    namespace: 'kube-system',
                    key: 'serviceToken',
                  },
                },
              },

              project: args.spec.project,
              config: args.spec.config,

              nameTransformer: args.spec.transformer,
            },
          },
        },
      },
      { parent: this },
    );

    new k8s.apiextensions.CustomResource(
      name,
      {
        apiVersion: 'external-secrets.io/v1beta1',
        kind: 'ExternalSecret',

        metadata: {
          name: args.metadata.name,
          namespace: args.metadata.namespace,
        },

        spec: {
          refreshInterval: '5m',

          secretStoreRef: {
            kind: store.kind,
            name: store.metadata.name,
          },

          target: {
            name: args.metadata.name,
          },

          dataFrom: [{ find: { name: { regexp: '.*' } } }],
        },
      },
      { parent: this },
    );

    this.metadata = pulumi.output({
      name: args.metadata.name,
      namespace: args.metadata.namespace,
    });
  }
}
