import * as aws from '@pulumi/aws';
import * as cloudflare from '@pulumi/cloudflare';
import * as pulumi from '@pulumi/pulumi';
import { bedrock } from '../ref';

type SiteArgs = {
  name: string;
  domain: string;
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

    const domain =
      stack === 'production'
        ? args.domain
        : `${args.domain.replaceAll('.', '-')}-${stack}.penxle.dev`;
    this.siteDomain = pulumi.output(domain);

    const zone = cloudflare.getZoneOutput(
      { name: 'penxle.dev' },
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
          certificateArn: bedrock('AWS_ACM_PENXLE_DEV_CERTIFICATE_ARN'),
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

    new cloudflare.Record(
      domain,
      {
        zoneId: zone.zoneId,
        type: 'CNAME',
        name: domain,
        value: domainName.domainNameConfiguration.targetDomainName,
        proxied: true,
        comment: 'Amazon CloudFront',
      },
      { parent: this },
    );
  }
}
