import * as aws from '@pulumi/aws';
import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import { DopplerSecret } from './doppler-secret';
import { IAMServiceAccount } from './iam-service-account';

type SiteArgs = {
  name: pulumi.Input<string>;
  domainName: pulumi.Input<string>;

  image: {
    name: pulumi.Input<string>;
    digest: pulumi.Input<string>;
  };

  resources: {
    cpu: pulumi.Input<string>;
    memory: pulumi.Input<string>;
  };

  iam?: {
    policy: pulumi.Input<aws.iam.PolicyDocument>;
  };

  secret?: {
    project: pulumi.Input<string>;
  };
};

export class Site extends pulumi.ComponentResource {
  public readonly url: pulumi.Output<string>;

  constructor(name: string, args: SiteArgs, opts?: pulumi.ComponentResourceOptions) {
    super('penxle:index:Site', name, {}, opts);

    const stack = pulumi.getStack();
    const isProd = stack === 'prod';

    const resourceName = isProd ? args.name : pulumi.interpolate`${args.name}-${stack}`;
    const domainName = isProd ? args.domainName : pulumi.interpolate`${args.name}-${stack}.pnxl.site`;
    this.url = pulumi.output(pulumi.interpolate`https://${domainName}`);

    const namespace = isProd ? 'prod' : 'preview';

    let secret;
    if (args.secret) {
      secret = new DopplerSecret(
        name,
        {
          metadata: {
            name: resourceName,
            namespace,
          },
          spec: {
            project: args.secret.project,
            config: isProd ? 'prod' : 'preview',
          },
        },
        { parent: this },
      );
    }

    let serviceAccount;
    if (args.iam) {
      serviceAccount = new IAMServiceAccount(
        name,
        {
          metadata: {
            name: resourceName,
            namespace,
          },
          spec: {
            policy: args.iam.policy,
          },
        },
        { parent: this },
      );
    }

    const labels = { app: resourceName };

    const deployment = new k8s.apps.v1.Deployment(
      name,
      {
        metadata: {
          name: resourceName,
          namespace,
        },
        spec: {
          selector: { matchLabels: labels },
          template: {
            metadata: { labels },
            spec: {
              ...(serviceAccount && { serviceAccountName: serviceAccount.metadata.name }),
              containers: [
                {
                  name: 'app',
                  image: pulumi.interpolate`${args.image.name}@${args.image.digest}`,
                  env: [{ name: 'HTTP_HOST', value: domainName }],
                  ...(secret && { envFrom: [{ secretRef: { name: secret.metadata.name } }] }),
                  resources: {
                    requests: { cpu: args.resources.cpu },
                    limits: { memory: args.resources.memory },
                  },
                },
              ],
            },
          },
        },
      },
      { parent: this },
    );

    new k8s.autoscaling.v2.HorizontalPodAutoscaler(
      name,
      {
        metadata: {
          name: resourceName,
          namespace,
        },
        spec: {
          scaleTargetRef: {
            apiVersion: deployment.apiVersion,
            kind: deployment.kind,
            name: deployment.metadata.name,
          },
          minReplicas: 1,
          maxReplicas: 100,
          metrics: [
            {
              type: 'Resource',
              resource: {
                name: 'cpu',
                target: { type: 'Utilization', averageUtilization: 80 },
              },
            },
          ],
        },
      },
      { parent: this },
    );

    const service = new k8s.core.v1.Service(
      name,
      {
        metadata: {
          name: resourceName,
          namespace,
        },
        spec: {
          clusterIP: 'None',
          selector: labels,
          ports: [{ port: 3000 }],
        },
      },
      { parent: this },
    );

    new k8s.networking.v1.Ingress(
      name,
      {
        metadata: {
          name: resourceName,
          namespace,
          annotations: {
            'alb.ingress.kubernetes.io/scheme': 'internet-facing',
            'alb.ingress.kubernetes.io/listen-ports': JSON.stringify([{ HTTP: 80, HTTPS: 443 }]),
            'alb.ingress.kubernetes.io/security-groups': 'alb, public-web',
            'alb.ingress.kubernetes.io/ssl-redirect': '443',
            ...(!isProd && { 'alb.ingress.kubernetes.io/group.name': 'penxle-preview' }),
            // 'alb.ingress.kubernetes.io/actions.www-redirect': JSON.stringify({
            //   Type: 'redirect',
            //   RedirectConfig: { Host: 'staging2.penxle.com', Port: '443', Protocol: 'HTTPS', StatusCode: 'HTTP_302' },
            // }),
          },
        },
        spec: {
          ingressClassName: 'alb',
          rules: [
            {
              host: domainName,
              http: {
                paths: [
                  {
                    path: '/',
                    pathType: 'Prefix',
                    backend: {
                      service: {
                        name: service.metadata.name,
                        port: { number: service.spec.ports[0].port },
                      },
                    },
                  },
                ],
              },
            },
            // {
            //   host: 'staging2.pnxl.co',
            //   http: {
            //     paths: [
            //       {
            //         path: '/',
            //         pathType: 'Prefix',
            //         backend: {
            //           service: {
            //             name: 'www-redirect',
            //             port: { name: 'use-annotation' },
            //           },
            //         },
            //       },
            //     ],
            //   },
            // },
          ],
        },
      },
      { parent: this },
    );

    // const usEast1 = new aws.Provider('us-east-1', { region: 'us-east-1' }, { parent: this });

    // const cloudfrontCertificate = aws.acm.getCertificateOutput(
    //   { domain: isProd ? args.dns.zone ?? args.dns.name : 'pnxl.site' },
    //   { parent: this, provider: usEast1 },
    // );

    // const distribution = new aws.cloudfront.Distribution(
    //   domain,
    //   {
    //     enabled: true,
    //     aliases: [domain],
    //     httpVersion: 'http2and3',

    //     origins: [
    //       {
    //         originId: 'lambda',
    //         domainName: lambdaUrl.functionUrl.apply((url) => new URL(url).hostname),
    //         customOriginConfig: {
    //           httpPort: 80,
    //           httpsPort: 443,
    //           originReadTimeout: 60,
    //           originKeepaliveTimeout: 60,
    //           originProtocolPolicy: 'https-only',
    //           originSslProtocols: ['TLSv1.2'],
    //         },
    //       },
    //     ],

    //     defaultCacheBehavior: {
    //       targetOriginId: 'lambda',
    //       viewerProtocolPolicy: 'redirect-to-https',
    //       compress: true,
    //       allowedMethods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE'],
    //       cachedMethods: ['GET', 'HEAD', 'OPTIONS'],
    //       cachePolicyId: bedrockRef('AWS_CLOUDFRONT_LAMBDA_CACHE_POLICY_ID'),
    //       originRequestPolicyId: bedrockRef('AWS_CLOUDFRONT_LAMBDA_ORIGIN_REQUEST_POLICY_ID'),
    //       responseHeadersPolicyId: bedrockRef('AWS_CLOUDFRONT_LAMBDA_RESPONSE_HEADERS_POLICY_ID'),
    //     },

    //     restrictions: {
    //       geoRestriction: {
    //         restrictionType: 'none',
    //       },
    //     },

    //     viewerCertificate: {
    //       acmCertificateArn: cloudfrontCertificate.arn,
    //       sslSupportMethod: 'sni-only',
    //       minimumProtocolVersion: 'TLSv1.2_2021',
    //     },

    //     waitForDeployment: false,
    //   },
    //   { parent: this },
    // );

    // const zone = aws.route53.getZoneOutput(
    //   { name: isProd ? args.dns.zone ?? args.dns.name : 'pnxl.site' },
    //   { parent: this },
    // );

    // new aws.route53.Record(
    //   domain,
    //   {
    //     zoneId: zone.zoneId,
    //     name: domain,
    //     type: 'A',
    //     aliases: [
    //       {
    //         name: distribution.domainName,
    //         zoneId: distribution.hostedZoneId,
    //         evaluateTargetHealth: false,
    //       },
    //     ],
    //   },
    //   { parent: this },
    // );
  }
}
