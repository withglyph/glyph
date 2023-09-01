import * as aws from '@pulumi/aws';

const lambdaCachePolicy = new aws.cloudfront.CachePolicy('lambda', {
  name: 'LambdaOrigin',
  comment: 'Cache policy for Lambda origins',

  minTtl: 0,
  defaultTtl: 0,
  maxTtl: 31_536_000,

  parametersInCacheKeyAndForwardedToOrigin: {
    enableAcceptEncodingBrotli: true,
    enableAcceptEncodingGzip: true,

    cookiesConfig: { cookieBehavior: 'none' },
    queryStringsConfig: { queryStringBehavior: 'none' },
    headersConfig: { headerBehavior: 'none' },
  },
});

const lambdaOriginRequestPolicy = new aws.cloudfront.OriginRequestPolicy(
  'lambda',
  {
    name: 'LambdaOrigin',
    comment: 'Origin request policy for Lambda origins',

    cookiesConfig: { cookieBehavior: 'all' },
    headersConfig: {
      headerBehavior: 'allExcept',
      headers: { items: ['Host'] },
    },
    queryStringsConfig: { queryStringBehavior: 'all' },
  },
);

const lambdaResponseHeadersPolicy = new aws.cloudfront.ResponseHeadersPolicy(
  'lambda',
  {
    name: 'LambdaOrigin',
    comment: 'Response headers policy for Lambda origins',

    securityHeadersConfig: {
      strictTransportSecurity: {
        override: true,
        accessControlMaxAgeSec: 31_536_000,
        includeSubdomains: true,
        preload: true,
      },
    },
  },
);

export const outputs = {
  AWS_CLOUDFRONT_LAMBDA_CACHE_POLICY_ID: lambdaCachePolicy.id,
  AWS_CLOUDFRONT_LAMBDA_ORIGIN_REQUEST_POLICY_ID: lambdaOriginRequestPolicy.id,
  AWS_CLOUDFRONT_LAMBDA_RESPONSE_HEADERS_POLICY_ID:
    lambdaResponseHeadersPolicy.id,
};
