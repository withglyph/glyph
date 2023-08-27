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

    cookiesConfig: { cookieBehavior: 'none' },
    queryStringsConfig: { queryStringBehavior: 'none' },
    headersConfig: { headerBehavior: 'none' },
  },
});

const apiGatewayOriginRequestPolicy = new aws.cloudfront.OriginRequestPolicy(
  'api-gateway',
  {
    name: 'APIGatewayOrigin',
    comment: 'Origin request policy for API Gateway origins',

    cookiesConfig: { cookieBehavior: 'all' },
    headersConfig: { headerBehavior: 'allViewer' },
    queryStringsConfig: { queryStringBehavior: 'all' },
  },
);

const apiGatewayResponseHeadersPolicy =
  new aws.cloudfront.ResponseHeadersPolicy('api-gateway', {
    name: 'APIGatewayOrigin',
    comment: 'Response headers policy for API Gateway origins',

    securityHeadersConfig: {
      strictTransportSecurity: {
        override: true,
        accessControlMaxAgeSec: 31_536_000,
        includeSubdomains: true,
        preload: true,
      },
    },
  });

export const outputs = {
  AWS_CLOUDFRONT_API_GATEWAY_CACHE_POLICY_ID: apiGatewayCachePolicy.id,
  AWS_CLOUDFRONT_API_GATEWAY_ORIGIN_REQUEST_POLICY_ID:
    apiGatewayOriginRequestPolicy.id,
  AWS_CLOUDFRONT_API_GATEWAY_RESPONSE_HEADERS_POLICY_ID:
    apiGatewayResponseHeadersPolicy.id,
};
