import * as aws from '@pulumi/aws';
import * as cloudflare from '@pulumi/cloudflare';
import * as pulumi from '@pulumi/pulumi';
import { bedrockRef } from '../ref';

type SiteArgs = {
  name: string;

  resources?: { memory?: number };
  dns: { name: string; zone?: string };
  iam?: { policy?: aws.iam.PolicyDocument };
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

    const isProd = stack === 'prod';

    const lambdaName = isProd ? args.name : `${stack}--${args.name}`;
    const domain = isProd ? args.dns.name : `${stack}--${args.name}.pnxl.site`;

    this.siteDomain = pulumi.output(`https://${domain}`);

    const usEast1 = new aws.Provider(
      'us-east-1',
      { region: 'us-east-1' },
      { parent: this },
    );

    const zone = cloudflare.getZoneOutput(
      { name: isProd ? args.dns.zone ?? args.dns.name : 'pnxl.site' },
      { parent: this },
    );

    const pkg = aws.s3.getObjectOutput(
      {
        bucket: bedrockRef('AWS_S3_BUCKET_ARTIFACTS_BUCKET'),
        key: `lambda/${stack}--${args.name}.zip`,
      },
      { parent: this },
    );

    const role = new aws.iam.Role(
      `${args.name}@lambda`,
      {
        name: `${stack}--${args.name}@lambda`,
        assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
          Service: 'lambda.amazonaws.com',
        }),
        managedPolicyArns: [
          aws.iam.ManagedPolicies.AWSLambdaVPCAccessExecutionRole,
        ],
      },
      { parent: this },
    );

    if (args.iam?.policy) {
      new aws.iam.RolePolicy(
        `${args.name}@lambda`,
        {
          role: role.name,
          policy: args.iam.policy,
        },
        { parent: this },
      );
    }

    const lambda = new aws.lambda.Function(
      args.name,
      {
        name: lambdaName,
        role: role.arn,

        runtime: 'nodejs18.x',
        architectures: ['x86_64'],

        memorySize: args.resources?.memory ?? 256,
        timeout: 59,

        s3Bucket: pkg.bucket,
        s3Key: pkg.key,
        handler: 'handler.handler',

        sourceCodeHash: pkg.metadata.Hash,

        environment: {
          variables: {
            HTTP_HOST: domain,
          },
        },

        vpcConfig: {
          subnetIds: [
            bedrockRef('AWS_VPC_SUBNET_PRIVATE_AZ1_ID'),
            bedrockRef('AWS_VPC_SUBNET_PRIVATE_AZ2_ID'),
          ],
          securityGroupIds: [bedrockRef('AWS_VPC_SECURITY_GROUP_INTERNAL_ID')],
        },
      },
      { parent: this },
    );

    // new aws.lambda.ProvisionedConcurrencyConfig(args.name, {
    //   functionName: lambda.name,
    //   provisionedConcurrentExecutions: 1,
    //   qualifier: '$LATEST',
    // }, { parent: this });

    const lambdaUrl = new aws.lambda.FunctionUrl(
      args.name,
      {
        functionName: lambda.name,
        authorizationType: 'NONE',
      },
      { parent: this },
    );

    const cloudfrontCertificate = aws.acm.getCertificateOutput(
      { domain: isProd ? args.dns.zone ?? args.dns.name : 'pnxl.site' },
      { parent: this, provider: usEast1 },
    );

    const distribution = new aws.cloudfront.Distribution(
      domain,
      {
        enabled: true,
        aliases: [domain],
        httpVersion: 'http2and3',

        origins: [
          {
            originId: 'lambda',
            domainName: lambdaUrl.functionUrl.apply(
              (url) => new URL(url).hostname,
            ),
            customOriginConfig: {
              httpPort: 80,
              httpsPort: 443,
              originReadTimeout: 60,
              originKeepaliveTimeout: 60,
              originProtocolPolicy: 'https-only',
              originSslProtocols: ['TLSv1.2'],
            },
          },
        ],

        defaultCacheBehavior: {
          targetOriginId: 'lambda',
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
          cachePolicyId: bedrockRef('AWS_CLOUDFRONT_LAMBDA_CACHE_POLICY_ID'),
          originRequestPolicyId: bedrockRef(
            'AWS_CLOUDFRONT_LAMBDA_ORIGIN_REQUEST_POLICY_ID',
          ),
          responseHeadersPolicyId: bedrockRef(
            'AWS_CLOUDFRONT_LAMBDA_RESPONSE_HEADERS_POLICY_ID',
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
        comment: 'Amazon CloudFront',
      },
      { parent: this },
    );
  }
}
