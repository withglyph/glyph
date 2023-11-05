import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

type RedirectArgs = {
  name: string;

  origin: {
    domain: string;
    zone?: string;
  };

  redirect: {
    to: string;
    code: number;
  };
};

export class Redirect extends pulumi.ComponentResource {
  constructor(name: string, args: RedirectArgs, opts?: pulumi.ComponentResourceOptions) {
    super('penxle:index:Redirect', name, {}, opts);

    const stack = pulumi.getStack();
    if (stack !== 'prod') {
      return;
    }

    const usEast1 = new aws.Provider(`${name}|us-east-1`, { region: 'us-east-1' }, { parent: this });

    const func = new aws.cloudfront.Function(
      name,
      {
        name: args.name,

        runtime: 'cloudfront-js-1.0',
        code: `
          function handler(event) {
            return {
              statusCode: ${args.redirect.code},
              headers: {
                location: { value: \`${args.redirect.to}\${event.request.uri}\` },
              },
            };
          }
        `,
      },
      { parent: this },
    );

    const cloudfrontCertificate = aws.acm.getCertificateOutput(
      { domain: args.origin.zone ?? args.origin.domain },
      { parent: this, provider: usEast1 },
    );

    const distribution = new aws.cloudfront.Distribution(
      name,
      {
        enabled: true,
        aliases: [args.origin.domain],
        httpVersion: 'http2and3',

        origins: [
          {
            originId: 'redirect',
            domainName: 'redirect.penxle.com',
            customOriginConfig: {
              httpPort: 80,
              httpsPort: 443,
              originProtocolPolicy: 'https-only',
              originSslProtocols: ['TLSv1.2'],
            },
          },
        ],

        defaultCacheBehavior: {
          targetOriginId: 'redirect',
          viewerProtocolPolicy: 'redirect-to-https',
          allowedMethods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE'],
          cachedMethods: ['GET', 'HEAD', 'OPTIONS'],
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          cachePolicyId: aws.cloudfront.getCachePolicyOutput({ name: 'Managed-CachingDisabled' }).apply((v) => v.id!),
          functionAssociations: [{ eventType: 'viewer-request', functionArn: func.arn }],
        },

        restrictions: {
          geoRestriction: {
            restrictionType: 'none',
          },
        },

        viewerCertificate: {
          acmCertificateArn: cloudfrontCertificate.arn,
          sslSupportMethod: 'sni-only',
          minimumProtocolVersion: 'TLSv1.2_2021',
        },

        waitForDeployment: false,
      },
      { parent: this },
    );

    const zone = aws.route53.getZoneOutput({ name: args.origin.zone ?? args.origin.domain }, { parent: this });

    new aws.route53.Record(
      name,
      {
        zoneId: zone.zoneId,
        name: args.origin.domain,
        type: 'A',
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
