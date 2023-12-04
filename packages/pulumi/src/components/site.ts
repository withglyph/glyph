import * as aws from '@pulumi/aws';
import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import { bedrockRef } from '../ref';
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

    const service = new k8s.core.v1.Service(
      name,
      {
        metadata: {
          name: resourceName,
          namespace,
          annotations: {
            'pulumi.com/skipAwait': 'true',
          },
        },
        spec: {
          type: 'NodePort',
          selector: labels,
          ports: [{ port: 3000 }],
        },
      },
      { parent: this },
    );

    const rollout = new k8s.apiextensions.CustomResource(
      name,
      {
        apiVersion: 'argoproj.io/v1alpha1',
        kind: 'Rollout',

        metadata: {
          name: resourceName,
          namespace,
          ...(isProd && {
            annotations: {
              'notifications.argoproj.io/subscribe.on-rollout-completed.slack': 'activities',
            },
          }),
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
                  env: [
                    { name: 'HTTP_HOST', value: domainName },
                    { name: 'PUBLIC_PULUMI_STACK', value: stack },
                  ],
                  ...(secret && { envFrom: [{ secretRef: { name: secret.metadata.name } }] }),
                  resources: {
                    requests: { cpu: args.resources.cpu },
                    limits: { memory: args.resources.memory },
                  },
                  livenessProbe: {
                    httpGet: { path: '/healthz', port: 3000 },
                    initialDelaySeconds: 5,
                    periodSeconds: 10,
                    failureThreshold: 3,
                  },
                  readinessProbe: {
                    httpGet: { path: '/api/healthz', port: 3000 },
                    initialDelaySeconds: 10,
                    periodSeconds: 20,
                    failureThreshold: 3,
                  },
                },
              ],
            },
          },
          strategy: {
            blueGreen: {
              activeService: service.metadata.name,
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
            apiVersion: rollout.apiVersion,
            kind: rollout.kind,
            name: rollout.metadata.name,
          },
          minReplicas: 2,
          maxReplicas: 100,
          metrics: [
            {
              type: 'Resource',
              resource: {
                name: 'cpu',
                target: { type: 'Utilization', averageUtilization: 50 },
              },
            },
          ],
        },
      },
      { parent: this },
    );

    new k8s.policy.v1.PodDisruptionBudget(
      name,
      {
        metadata: {
          name: resourceName,
          namespace,
        },
        spec: {
          selector: { matchLabels: labels },
          minAvailable: 1,
        },
      },
      { parent: this },
    );

    const ingress = new k8s.networking.v1.Ingress(
      name,
      {
        metadata: {
          name: resourceName,
          namespace,
          annotations: {
            'alb.ingress.kubernetes.io/group.name': 'public-alb',
            'alb.ingress.kubernetes.io/listen-ports': JSON.stringify([{ HTTPS: 443 }]),
            'alb.ingress.kubernetes.io/healthcheck-path': '/api/healthz',
            ...(isProd && { 'external-dns.alpha.kubernetes.io/ingress-hostname-source': 'annotation-only' }),
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
          ],
        },
      },
      { parent: this },
    );

    if (isProd) {
      const domainZone = pulumi.output(domainName).apply((domainName) => domainName.split('.').slice(-2).join('.'));
      const zone = aws.route53.getZoneOutput({ name: domainZone });

      const distribution = new aws.cloudfront.Distribution(
        name,
        {
          enabled: true,
          aliases: [domainName],
          httpVersion: 'http2and3',

          origins: [
            {
              originId: 'alb',
              domainName: ingress.status.loadBalancer.ingress[0].hostname,
              customOriginConfig: {
                httpPort: 80,
                httpsPort: 443,
                originProtocolPolicy: 'https-only',
                originSslProtocols: ['TLSv1.2'],
                originReadTimeout: 60,
                originKeepaliveTimeout: 60,
              },
              originShield: {
                enabled: true,
                originShieldRegion: 'ap-northeast-2',
              },
            },
          ],

          defaultCacheBehavior: {
            targetOriginId: 'alb',
            compress: true,
            viewerProtocolPolicy: 'redirect-to-https',
            allowedMethods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE'],
            cachedMethods: ['GET', 'HEAD', 'OPTIONS'],
            cachePolicyId: bedrockRef('AWS_CLOUDFRONT_DYNAMIC_CACHE_POLICY_ID'),
            originRequestPolicyId: bedrockRef('AWS_CLOUDFRONT_DYNAMIC_ORIGIN_REQUEST_POLICY_ID'),
            responseHeadersPolicyId: bedrockRef('AWS_CLOUDFRONT_DYNAMIC_RESPONSE_HEADERS_POLICY_ID'),
          },

          restrictions: {
            geoRestriction: {
              restrictionType: 'none',
            },
          },

          viewerCertificate: {
            acmCertificateArn: bedrockRef(
              pulumi.interpolate`AWS_ACM_CLOUDFRONT_${domainZone.apply((v) =>
                v.replaceAll('.', '_').toUpperCase(),
              )}_CERTIFICATE_ARN`,
            ),
            sslSupportMethod: 'sni-only',
            minimumProtocolVersion: 'TLSv1.2_2021',
          },
        },
        { parent: this },
      );

      new aws.route53.Record(
        name,
        {
          name: domainName,
          type: 'A',
          zoneId: zone.zoneId,
          aliases: [
            {
              name: distribution.domainName,
              zoneId: distribution.hostedZoneId,
              evaluateTargetHealth: false,
            },
          ],
        },
        { parent: this },
      );
    }
  }
}
