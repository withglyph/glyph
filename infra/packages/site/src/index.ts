import * as aws from '@pulumi/aws';
import * as cloudflare from '@pulumi/cloudflare';
import * as pulumi from '@pulumi/pulumi';
import { bedrock } from './ref';

type SiteArgs = {
  name: string;
  domain: string;
  subdomain?: string;
};

export class Site extends pulumi.ComponentResource {
  public readonly siteDomain: pulumi.Output<string>;

  constructor(
    name: string,
    args: SiteArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super('penxle:site:Site', name, {}, opts);

    const stack = pulumi.getStack();

    const _domain = args.subdomain
      ? `${args.subdomain}.${args.domain}`
      : args.domain;
    const domain = stack === 'production' ? _domain : `${stack}.dev.${_domain}`;
    this.siteDomain = pulumi.output(domain);

    const zone = cloudflare.getZoneOutput(
      { name: args.domain },
      { parent: this },
    );

    const certificate = new aws.acm.Certificate(
      domain,
      {
        domainName: domain,
        validationMethod: 'DNS',
      },
      {
        parent: this,
        provider: new aws.Provider('us-east-1', {
          region: 'us-east-1',
        }),
      },
    );

    new cloudflare.Record(
      `_acm.${domain}`,
      {
        zoneId: zone.zoneId,
        name: certificate.domainValidationOptions[0].resourceRecordName,
        type: certificate.domainValidationOptions[0].resourceRecordType,
        value: certificate.domainValidationOptions[0].resourceRecordValue,
      },
      { parent: this },
    );

    const pkg = aws.s3.getObjectOutput(
      {
        bucket: bedrock('AWS_S3_BUCKET_ARTIFACTS_BUCKET'),
        key: `lambda/${args.name}-${stack}.zip`,
      },
      { parent: this },
    );

    const role = new aws.iam.Role(
      `${args.name}@lambda`,
      {
        assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
          Service: 'lambda.amazonaws.com',
        }),
        managedPolicyArns: [
          aws.iam.ManagedPolicies.AWSLambdaBasicExecutionRole,
        ],
      },
      { parent: this },
    );

    const lambda = new aws.lambda.Function(
      args.name,
      {
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

    const api = new aws.apigatewayv2.Api(
      args.name,
      {
        protocolType: 'HTTP',
      },
      { parent: this },
    );

    const integration = new aws.apigatewayv2.Integration(
      args.name,
      {
        apiId: api.id,
        integrationType: 'AWS_PROXY',
        integrationUri: lambda.arn,
        payloadFormatVersion: '2.0',
      },
      { parent: this },
    );

    new aws.apigatewayv2.Route(
      args.name,
      {
        apiId: api.id,
        routeKey: '$default',
        target: pulumi.interpolate`integrations/${integration.id}`,
      },
      { parent: this },
    );

    new aws.apigatewayv2.Stage(
      args.name,
      {
        name: '$default',
        apiId: api.id,
        autoDeploy: true,
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
            domainName: api.apiEndpoint.apply((endpoint) =>
              endpoint.replace('https://', ''),
            ),
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
          cachePolicyId: bedrock('AWS_CLOUDFRONT_API_GATEWAY_CACHE_POLICY_ID'),
          originRequestPolicyId: bedrock(
            'AWS_CLOUDFRONT_API_GATEWAY_ORIGIN_REQUEST_POLICY_ID',
          ),
        },

        restrictions: {
          geoRestriction: {
            restrictionType: 'none',
          },
        },

        viewerCertificate: {
          acmCertificateArn: certificate.arn,
          sslSupportMethod: 'sni-only',
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
      },
      { parent: this },
    );
  }
}
