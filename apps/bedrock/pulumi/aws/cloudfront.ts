import * as aws from '@pulumi/aws';
import { usEast1 } from '$aws/providers';
import { zones } from '$aws/route53';

const createCertificate = (domain: string) => {
  const certificate = new aws.acm.Certificate(
    `cloudfront/${domain}`,
    {
      domainName: domain,
      subjectAlternativeNames: [`*.${domain}`],
      validationMethod: 'DNS',
    },
    { provider: usEast1 },
  );

  new aws.acm.CertificateValidation(`${domain}|cloudfront`, { certificateArn: certificate.arn }, { provider: usEast1 });

  return certificate;
};

export const certificates = {
  effit_so: createCertificate('effit.so'),
  effit_io: createCertificate('effit.io'),
  effit_dev: createCertificate('effit.dev'),
  efft_me: createCertificate('efft.me'),
  pencil_so: createCertificate('pencil.so'),
  penxle_com: createCertificate('penxle.com'),
  penxle_io: createCertificate('penxle.io'),
  pnxl_cc: createCertificate('pnxl.cc'),
  pnxl_co: createCertificate('pnxl.co'),
  pnxl_me: createCertificate('pnxl.me'),
  pnxl_net: createCertificate('pnxl.net'),
  pnxl_site: createCertificate('pnxl.site'),
};

const originAccessControl = new aws.cloudfront.OriginAccessControl('s3', {
  name: 's3',
  description: 'Origin access control for S3 origins',

  originAccessControlOriginType: 's3',
  signingBehavior: 'always',
  // spell-checker:disable-next-line
  signingProtocol: 'sigv4',
});

const dynamicCachePolicy = new aws.cloudfront.CachePolicy('dynamic', {
  name: 'DynamicContents',
  comment: 'Cache policy for dynamic contents',

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

const dynamicOriginRequestPolicy = new aws.cloudfront.OriginRequestPolicy('dynamic', {
  name: 'DynamicContents',
  comment: 'Origin request policy for dynamic contents',

  cookiesConfig: { cookieBehavior: 'all' },
  headersConfig: { headerBehavior: 'allViewer' },
  queryStringsConfig: { queryStringBehavior: 'all' },
});

const dynamicResponseHeadersPolicy = new aws.cloudfront.ResponseHeadersPolicy('dynamic', {
  name: 'DynamicContents',
  comment: 'Response headers policy for dynamic contents',

  securityHeadersConfig: {
    strictTransportSecurity: {
      override: true,
      accessControlMaxAgeSec: 31_536_000,
      includeSubdomains: true,
      preload: true,
    },
  },
});

const cdnCachePolicy = new aws.cloudfront.CachePolicy('cdn', {
  name: 'CDNOrigin',
  comment: 'Cache policy for CDN origins',

  minTtl: 0,
  defaultTtl: 86_400,
  maxTtl: 31_536_000,

  parametersInCacheKeyAndForwardedToOrigin: {
    enableAcceptEncodingBrotli: true,
    enableAcceptEncodingGzip: true,

    cookiesConfig: { cookieBehavior: 'none' },
    headersConfig: { headerBehavior: 'none' },
    queryStringsConfig: { queryStringBehavior: 'all' },
  },
});

const cdnOriginRequestPolicy = new aws.cloudfront.OriginRequestPolicy('cdn', {
  name: 'CDNOrigin',
  comment: 'Origin request policy for CDN origins',

  cookiesConfig: { cookieBehavior: 'none' },
  headersConfig: { headerBehavior: 'none' },
  queryStringsConfig: { queryStringBehavior: 'all' },
});

const cdnResponseHeadersPolicy = new aws.cloudfront.ResponseHeadersPolicy('cdn', {
  name: 'CDNOrigin',
  comment: 'Response headers policy for CDN origins',

  corsConfig: {
    accessControlAllowOrigins: { items: ['*'] },
    accessControlAllowHeaders: { items: ['*'] },
    accessControlAllowMethods: { items: ['GET'] },
    accessControlAllowCredentials: false,
    originOverride: true,
  },

  securityHeadersConfig: {
    strictTransportSecurity: {
      override: true,
      accessControlMaxAgeSec: 31_536_000,
      includeSubdomains: true,
      preload: true,
    },
  },
});

const pnxlNet = new aws.cloudfront.Distribution('pnxl.net', {
  enabled: true,
  aliases: ['pnxl.net'],
  httpVersion: 'http2and3',

  origins: [
    {
      originId: 'penxle-data',
      domainName: 'penxle-data.s3.amazonaws.com',
      originAccessControlId: originAccessControl.id,
      originShield: { enabled: true, originShieldRegion: 'ap-northeast-2' },
    },
    {
      originId: 'penxle-images',
      // spell-checker:disable-next-line
      domainName: 'penxle-images-zjf3dm5q7dybsggznshhnpyqapn2a--ol-s3.s3.ap-northeast-2.amazonaws.com',
      originAccessControlId: originAccessControl.id,
      originShield: { enabled: true, originShieldRegion: 'ap-northeast-2' },
    },
  ],

  defaultCacheBehavior: {
    targetOriginId: 'penxle-data',
    compress: true,
    viewerProtocolPolicy: 'redirect-to-https',
    allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
    cachedMethods: ['GET', 'HEAD', 'OPTIONS'],
    cachePolicyId: cdnCachePolicy.id,
    originRequestPolicyId: cdnOriginRequestPolicy.id,
    responseHeadersPolicyId: cdnResponseHeadersPolicy.id,
  },

  orderedCacheBehaviors: [
    {
      pathPattern: 'images/*',
      targetOriginId: 'penxle-images',
      compress: true,
      viewerProtocolPolicy: 'redirect-to-https',
      allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
      cachedMethods: ['GET', 'HEAD', 'OPTIONS'],
      cachePolicyId: cdnCachePolicy.id,
      originRequestPolicyId: cdnOriginRequestPolicy.id,
      responseHeadersPolicyId: cdnResponseHeadersPolicy.id,
    },
  ],

  restrictions: {
    geoRestriction: {
      restrictionType: 'none',
    },
  },

  viewerCertificate: {
    acmCertificateArn: certificates.pnxl_net.arn,
    sslSupportMethod: 'sni-only',
    minimumProtocolVersion: 'TLSv1.2_2021',
  },

  waitForDeployment: false,
});

new aws.route53.Record('pnxl.net', {
  zoneId: zones.pnxl_net.zoneId,
  type: 'A',
  name: 'pnxl.net',
  aliases: [
    {
      name: pnxlNet.domainName,
      zoneId: pnxlNet.hostedZoneId,
      evaluateTargetHealth: false,
    },
  ],
});

export const outputs = {
  AWS_ACM_CLOUDFRONT_EFFIT_SO_CERTIFICATE_ARN: certificates.effit_so.arn,
  AWS_ACM_CLOUDFRONT_EFFIT_IO_CERTIFICATE_ARN: certificates.effit_io.arn,
  AWS_ACM_CLOUDFRONT_EFFIT_DEV_CERTIFICATE_ARN: certificates.effit_dev.arn,
  AWS_ACM_CLOUDFRONT_EFFT_ME_CERTIFICATE_ARN: certificates.efft_me.arn,
  AWS_ACM_CLOUDFRONT_PENCIL_SO_CERTIFICATE_ARN: certificates.pencil_so.arn,
  AWS_ACM_CLOUDFRONT_PENXLE_COM_CERTIFICATE_ARN: certificates.penxle_com.arn,
  AWS_ACM_CLOUDFRONT_PENXLE_IO_CERTIFICATE_ARN: certificates.penxle_io.arn,
  AWS_ACM_CLOUDFRONT_PNXL_CC_CERTIFICATE_ARN: certificates.pnxl_cc.arn,
  AWS_ACM_CLOUDFRONT_PNXL_CO_CERTIFICATE_ARN: certificates.pnxl_co.arn,
  AWS_ACM_CLOUDFRONT_PNXL_ME_CERTIFICATE_ARN: certificates.pnxl_me.arn,
  AWS_ACM_CLOUDFRONT_PNXL_NET_CERTIFICATE_ARN: certificates.pnxl_net.arn,
  AWS_ACM_CLOUDFRONT_PNXL_SITE_CERTIFICATE_ARN: certificates.pnxl_site.arn,

  AWS_CLOUDFRONT_DYNAMIC_CACHE_POLICY_ID: dynamicCachePolicy.id,
  AWS_CLOUDFRONT_DYNAMIC_ORIGIN_REQUEST_POLICY_ID: dynamicOriginRequestPolicy.id,
  AWS_CLOUDFRONT_DYNAMIC_RESPONSE_HEADERS_POLICY_ID: dynamicResponseHeadersPolicy.id,
};
