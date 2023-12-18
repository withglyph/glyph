import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { zones } from '$aws/route53';
import { securityGroups, subnets } from '$aws/vpc';

const cluster = new aws.elasticache.ReplicationGroup('penxle', {
  replicationGroupId: 'penxle',
  description: 'Redis cluster',

  engine: 'redis',
  engineVersion: '7.1',

  nodeType: 'cache.r6g.large',
  numCacheClusters: 1,

  subnetGroupName: new aws.elasticache.SubnetGroup('private', {
    name: 'private',
    subnetIds: [subnets.private.az1.id, subnets.private.az2.id],
  }).name,
  securityGroupIds: [securityGroups.internal.id],

  multiAzEnabled: false,
  automaticFailoverEnabled: false,

  atRestEncryptionEnabled: true,
  transitEncryptionEnabled: false,

  snapshotRetentionLimit: 7,
  finalSnapshotIdentifier: 'penxle-final-snapshot',

  snapshotWindow: '19:00-20:00',
  maintenanceWindow: 'sun:20:00-sun:22:00',

  applyImmediately: true,
});

new aws.route53.Record('redis.pnxl.co', {
  zoneId: zones.pnxl_co.zoneId,
  type: 'CNAME',
  name: 'redis.pnxl.co',
  records: [cluster.primaryEndpointAddress],
  ttl: 300,
});

export const outputs = {
  AWS_ELASTICACHE_PENXLE_CONNECTION_URL: pulumi.interpolate`redis://${cluster.primaryEndpointAddress}`,
};
