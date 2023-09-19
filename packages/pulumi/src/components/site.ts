import * as aws from '@pulumi/aws';
import * as cloudflare from '@pulumi/cloudflare';
import * as pulumi from '@pulumi/pulumi';
import { bedrockRef } from '../ref';

type SiteArgs = {
  name: string;

  resources?: { memory?: number };
  concurrency?: { reserved?: number; provisioned?: number };
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
          aws.iam.ManagedPolicy.AWSLambdaVPCAccessExecutionRole,
          aws.iam.ManagedPolicy.AWSXRayDaemonWriteAccess,
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

    if (isProd) {
      new aws.iam.RolePolicy(`${args.name}_dd@lambda`, {
        role: role.name,
        policy: {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Action: ['secretsmanager:GetSecretValue'],
              Resource: [
                'arn:aws:secretsmanager:ap-northeast-2:721144421085:secret:datadog/*',
              ],
            },
          ],
        },
      });
    }

    const lambda = new aws.lambda.Function(
      args.name,
      {
        name: lambdaName,
        role: role.arn,

        runtime: 'nodejs18.x',
        architectures: ['arm64'],

        memorySize: args.resources?.memory ?? 1024,
        timeout: 59,
        reservedConcurrentExecutions: isProd
          ? args.concurrency?.reserved ?? -1
          : -1,

        s3Bucket: pkg.bucket,
        s3Key: pkg.key,
        handler: 'handler.handler',

        sourceCodeHash: pkg.metadata.Hash,

        publish: true,

        layers: isProd
          ? [
              'arn:aws:lambda:ap-northeast-2:464622532012:layer:Datadog-Extension-ARM:48',
            ]
          : undefined,

        environment: {
          variables: {
            HTTP_HOST: domain,

            ...(isProd && {
              DD_SITE: 'ap1.datadoghq.com',
              DD_API_KEY_SECRET_ARN:
                'arn:aws:secretsmanager:ap-northeast-2:721144421085:secret:datadog/api-key-cWrlAs',

              DD_SERVICE: args.name,
              DD_ENV: stack,
              DD_VERSION: 'latest',

              DD_CAPTURE_LAMBDA_PAYLOAD: 'true',
              DD_DBM_PROPAGATION_MODE: 'full',
              DD_LOGS_INJECTION: 'true',
            }),
          },
        },

        tracingConfig: {
          mode: 'Active',
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

    const alias = new aws.lambda.Alias(
      args.name,
      {
        name: 'latest',

        functionName: lambda.name,
        functionVersion: lambda.version,
      },
      { parent: this },
    );

    if (isProd && args.concurrency?.provisioned) {
      new aws.lambda.ProvisionedConcurrencyConfig(
        args.name,
        {
          functionName: lambda.name,
          qualifier: alias.name,
          provisionedConcurrentExecutions: args.concurrency.provisioned,
        },
        { parent: this },
      );
    }

    const lambdaUrl = new aws.lambda.FunctionUrl(
      args.name,
      {
        functionName: lambda.name,
        qualifier: alias.name,
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
