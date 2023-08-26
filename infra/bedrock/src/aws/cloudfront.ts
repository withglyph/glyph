import * as aws from '@pulumi/aws';

const apiGatewayCachePolicy = new aws.cloudfront.CachePolicy('api-gateway', {
  name: 'APIGatewayOrigin',
  comment: 'Cache policy for API Gateway origins',

  minTtl: 0,
  defaultTtl: 0,
  maxTtl: 31_536_000,

  parametersInCacheKeyAndForwardedToOrigin: {
    enableAcceptEncodingBrotli: true,
    enableAcceptEncodingGzip: true,

    cookiesConfig: { cookieBehavior: 'all' },
    queryStringsConfig: { queryStringBehavior: 'all' },
    headersConfig: {
      headerBehavior: 'none',
      // headers: { items: ['Authorization'] },
    },
  },
});

const apiGatewayOriginRequestPolicy = new aws.cloudfront.OriginRequestPolicy(
  'api-gateway',
  {
    name: 'APIGatewayOrigin',
    comment: 'Origin request policy for API Gateway origins',

    cookiesConfig: { cookieBehavior: 'all' },
    headersConfig: {
      headerBehavior: 'allExcept',
      headers: { items: ['Host'] },
    },
    queryStringsConfig: { queryStringBehavior: 'all' },
  },
);

export const outputs = {
  AWS_CLOUDFRONT_API_GATEWAY_CACHE_POLICY_ID: apiGatewayCachePolicy.id,
  AWS_CLOUDFRONT_API_GATEWAY_ORIGIN_REQUEST_POLICY_ID:
    apiGatewayOriginRequestPolicy.id,
};
