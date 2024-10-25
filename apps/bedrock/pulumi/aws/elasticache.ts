import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { zones } from '$aws/route53';
import { securityGroups, subnets } from '$aws/vpc';

const subnetGroup = new aws.elasticache.SubnetGroup('private', {
  name: 'private',
  description: 'Private subnets',
  subnetIds: [subnets.private.az1.id, subnets.private.az2.id],
});

const cluster = new aws.elasticache.ReplicationGroup('penxle', {
  replicationGroupId: 'penxle',
  description: 'Redis cluster',

  engine: 'redis',
  engineVersion: '7.1',

  nodeType: 'cache.t4g.micro',

  // clusterMode: 'enabled',
  numNodeGroups: 1,
  replicasPerNodeGroup: 0,

  subnetGroupName: subnetGroup.name,
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

new aws.route53.Record('redis.withglyph.io', {
  zoneId: zones.withglyph_io.zoneId,
  type: 'CNAME',
  name: 'redis.withglyph.io',
  records: [cluster.primaryEndpointAddress],
  ttl: 300,
});

export const outputs = {
  AWS_ELASTICACHE_PENXLE_CONNECTION_URL: pulumi.interpolate`redis://${cluster.primaryEndpointAddress}`,
};
