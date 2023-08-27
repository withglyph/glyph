import * as aws from '@pulumi/aws';
import * as cloudflare from '@pulumi/cloudflare';
import * as pulumi from '@pulumi/pulumi';
import { bedrockRef } from '../ref';

type SiteArgs = {
  name: string;
  iamPolicy?: aws.iam.PolicyDocument;

  domain: string;
  zone: string;
};

export class Site extends pulumi.ComponentResource {
  public readonly siteDomain: pulumi.Output<string>;

  constructor(
    name: string,
    args: SiteArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super('penxle:index:Site', name, {}, opts);

    const stack = pulumi.getStack();

    const isProd = stack === 'production';

    const resourceName = `${args.name}-${stack}`;
    const domain = isProd
      ? args.domain
      : `${stack}-${args.domain.replaceAll('.', '-')}.pnxl.site`;

    this.siteDomain = pulumi.output(domain);

    const usEast1 = new aws.Provider(
      'us-east-1',
      { region: 'us-east-1' },
      { parent: this },
    );

    const zone = cloudflare.getZoneOutput(
      { name: isProd ? args.zone : 'pnxl.site' },
      { parent: this },
    );

    const pkg = aws.s3.getObjectOutput(
      {
        bucket: bedrockRef('AWS_S3_BUCKET_ARTIFACTS_BUCKET'),
        key: `lambda/${resourceName}.zip`,
      },
      { parent: this },
    );

    const role = new aws.iam.Role(
      `${args.name}@lambda`,
      {
        name: `${resourceName}@lambda`,
        assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
          Service: 'lambda.amazonaws.com',
        }),
        managedPolicyArns: [
          aws.iam.ManagedPolicies.AWSLambdaBasicExecutionRole,
        ],
      },
      { parent: this },
    );

    if (args.iamPolicy) {
      new aws.iam.RolePolicy(
        `${args.name}@lambda`,
        {
          role: role.name,
          policy: args.iamPolicy,
        },
        { parent: this },
      );
    }

    const lambda = new aws.lambda.Function(
      args.name,
      {
        name: resourceName,
        role: role.arn,

        runtime: 'nodejs18.x',
        architectures: ['x86_64'],

        memorySize: 2048,
        timeout: 29,

        s3Bucket: pkg.bucket,
        s3Key: pkg.key,
        handler: 'index.handler',

        sourceCodeHash: pkg.metadata.Hash,
      },
      { parent: this },
    );

    new aws.lambda.Permission(
      args.name,
      {
        function: lambda.name,
        action: 'lambda:InvokeFunction',
        principal: 'apigateway.amazonaws.com',
      },
      { parent: this },
    );

    const apiGatewayCertificate = aws.acm.getCertificateOutput(
      { domain: isProd ? args.zone : 'pnxl.site' },
      { parent: this },
    );

    const cloudfrontCertificate = aws.acm.getCertificateOutput(
      { domain: isProd ? args.zone : 'pnxl.site' },
      { parent: this, provider: usEast1 },
    );

    const api = new aws.apigatewayv2.Api(
      args.name,
      {
        name: resourceName,
        protocolType: 'HTTP',
        target: lambda.arn,
      },
      { parent: this },
    );

    const domainName = new aws.apigatewayv2.DomainName(
      args.name,
      {
        domainName: domain,
        domainNameConfiguration: {
          endpointType: 'REGIONAL',
          certificateArn: apiGatewayCertificate.arn,
          securityPolicy: 'TLS_1_2',
        },
      },
      { parent: this },
    );

    new aws.apigatewayv2.ApiMapping(
      args.name,
      {
        apiId: api.id,
        domainName: domainName.domainName,
        stage: '$default',
      },
      { parent: this },
    );

    const distribution = new aws.cloudfront.Distribution(
      domain,
      {
        enabled: true,
        aliases: [domain],
        httpVersion: 'http2and3',

        origins: [
          {
            originId: 'apigateway',
            domainName: domainName.domainNameConfiguration.targetDomainName,
            customOriginConfig: {
              httpPort: 80,
              httpsPort: 443,
              originProtocolPolicy: 'https-only',
              originSslProtocols: ['TLSv1.2'],
            },
          },
        ],

        defaultCacheBehavior: {
          targetOriginId: 'apigateway',
          viewerProtocolPolicy: 'redirect-to-https',
          compress: true,
          allowedMethods: [
            'GET',
            'HEAD',
            'OPTIONS',
            'PUT',
            'POST',
            'PATCH',
            'DELETE',
          ],
          cachedMethods: ['GET', 'HEAD', 'OPTIONS'],
          cachePolicyId: bedrockRef(
            'AWS_CLOUDFRONT_API_GATEWAY_CACHE_POLICY_ID',
          ),
          originRequestPolicyId: bedrockRef(
            'AWS_CLOUDFRONT_API_GATEWAY_ORIGIN_REQUEST_POLICY_ID',
          ),
          responseHeadersPolicyId: bedrockRef(
            'AWS_CLOUDFRONT_API_GATEWAY_RESPONSE_HEADERS_POLICY_ID',
          ),
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

    new cloudflare.Record(
      domain,
      {
        zoneId: zone.zoneId,
        type: 'CNAME',
        name: domain,
        value: distribution.domainName,
        proxied: !isProd,
        comment: 'Amazon CloudFront',
      },
      { parent: this },
    );
  }
}
