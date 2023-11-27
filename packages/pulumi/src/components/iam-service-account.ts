import * as aws from '@pulumi/aws';
import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import { bedrockRef } from '../ref';

type IAMServiceAccountArgs = {
  metadata: {
    name: pulumi.Input<string>;
    namespace: pulumi.Input<string>;
  };
  spec: {
    policy: pulumi.Input<aws.iam.PolicyDocument>;
  };
};

type IAMServiceAccountOutputMetadata = {
  name: string;
  namespace: string;
};

export class IAMServiceAccount extends pulumi.ComponentResource {
  public readonly metadata: pulumi.Output<IAMServiceAccountOutputMetadata>;

  constructor(name: string, args: IAMServiceAccountArgs, opts?: pulumi.ComponentResourceOptions) {
    super('penxle:index:IAMServiceAccount', name, {}, opts);

    const oidcProviderUrl = bedrockRef('AWS_EKS_CLUSTER_OIDC_PROVIDER_URL');

    const role = new aws.iam.Role(`${name}@eks`, {
      name: pulumi.interpolate`${args.metadata.name}+${args.metadata.namespace}@eks`,
      assumeRolePolicy: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { Federated: bedrockRef('AWS_EKS_CLUSTER_OIDC_PROVIDER_ARN') },
            Action: 'sts:AssumeRoleWithWebIdentity',
            Condition: oidcProviderUrl.apply((url) => ({
              StringEquals: {
                [`${url}:aud`]: 'sts.amazonaws.com',
                [`${url}:sub`]: pulumi.interpolate`system:serviceaccount:${args.metadata.namespace}:${args.metadata.name}`,
              },
            })),
          },
        ],
      },
    });

    new aws.iam.RolePolicy(`${name}@eks`, {
      role: role.name,
      policy: args.spec.policy,
    });

    const serviceAccount = new k8s.core.v1.ServiceAccount(name, {
      metadata: {
        name: args.metadata.name,
        namespace: args.metadata.namespace,
        annotations: {
          'eks.amazonaws.com/role-arn': role.arn,
        },
      },
    });

    this.metadata = pulumi.output({
      name: serviceAccount.metadata.name,
      namespace: serviceAccount.metadata.namespace,
    });
  }
}
