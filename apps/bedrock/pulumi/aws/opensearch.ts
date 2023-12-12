import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { certificates } from '$aws/acm';
import { securityGroups, subnets } from '$aws/vpc';

const domain = new aws.opensearch.Domain('penxle', {
  engineVersion: 'OpenSearch_2.11',
  domainName: 'penxle',

  clusterConfig: {
    instanceType: 'r6g.2xlarge.search',
    instanceCount: 1,
  },

  ebsOptions: {
    ebsEnabled: true,
    volumeSize: 100,
    volumeType: 'gp3',
  },

  vpcOptions: {
    subnetIds: [subnets.private.az1.id],
    securityGroupIds: [securityGroups.internal.id],
  },

  offPeakWindowOptions: {
    enabled: true,
    // off-peak 시간은 10시간, UTC 기준 -> 한국 시간으로 03시 ~ 13시
    offPeakWindow: { windowStartTime: { hours: 18, minutes: 0 } },
  },

  domainEndpointOptions: {
    customEndpointEnabled: true,
    customEndpoint: 'search.pnxl.co',
    customEndpointCertificateArn: certificates.pnxl_co.arn,
    enforceHttps: true,
  },

  encryptAtRest: { enabled: true },
  nodeToNodeEncryption: { enabled: true },
  softwareUpdateOptions: { autoSoftwareUpdateEnabled: true },
});

new aws.opensearch.DomainPolicy('penxle', {
  domainName: domain.domainName,
  accessPolicies: domain.arn.apply((arn) =>
    JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            AWS: '*',
          },
          Action: ['es:*'],
          Resource: `${arn}/*`,
        },
      ],
    }),
  ),
});

new aws.opensearch.PackageAssociation('analysis-nori@penxle', {
  domainName: domain.domainName,
  packageId: 'G248827013',
});

export const opensearch = {
  domain,
};

export const outputs = {
  AWS_OPENSEARCH_PENXLE_CONNECTION_URL: pulumi.interpolate`https://${domain.endpoint}`,
};
