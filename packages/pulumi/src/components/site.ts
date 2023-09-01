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
      : `${stack}-${args.name.replaceAll('_', '-')}.pnxl.site`;

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
          aws.iam.ManagedPolicies.AWSLambdaVPCAccessExecutionRole,
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
    // });

    const lambdaUrl = new aws.lambda.FunctionUrl(
      args.name,
      {
        functionName: lambda.name,
        authorizationType: 'NONE',
      },
      { parent: this },
    );

    const cloudfrontCertificate = aws.acm.getCertificateOutput(
      { domain: isProd ? args.zone : 'pnxl.site' },
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
