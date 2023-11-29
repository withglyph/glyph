import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { securityGroups, subnets, vpc } from '$aws/vpc';

const domain = new aws.opensearch.Domain('penxle', {
  engineVersion: 'OpenSearch_2.11',
  domainName: 'penxle',

  clusterConfig: {
    instanceType: 't3.small.search',
    instanceCount: 1,
  },

  ebsOptions: {
    ebsEnabled: true,
    volumeSize: 100,
    volumeType: 'gp3',
  },

  vpcOptions: {
    vpcId: vpc.id,
    securityGroupIds: [securityGroups.internal.id],
    subnetIds: [subnets.private.az1.id, subnets.private.az2.id],
  },

  offPeakWindowOptions: {
    enabled: true,
    // off-peak 시간은 10시간, UTC 기준 -> 한국 시간으로 03시 ~ 13시
    offPeakWindow: { windowStartTime: { hours: 18, minutes: 0 } },
  },
});

export const opensearch = {
  domain,
};

export const outputs = {
  AWS_OPENSEARCH_PENXLE_CONNECTION_URL: pulumi.interpolate`https://${domain.endpoint}`,
};
