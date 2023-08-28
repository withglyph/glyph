import * as aws from '@pulumi/aws';
import { securityGroups, subnets } from '$aws/vpc';

new aws.elasticache.ReplicationGroup('penxle', {
  replicationGroupId: 'penxle',
  description: 'Redis cluster',

  engine: 'redis',
  engineVersion: '7.0',

  nodeType: 'cache.t4g.micro',
  numCacheClusters: 1,

  subnetGroupName: new aws.elasticache.SubnetGroup('private', {
    name: 'private',
    subnetIds: [subnets.private.az1.id, subnets.private.az2.id],
  }).name,
  securityGroupIds: [securityGroups.internal.id],

  multiAzEnabled: false,
  automaticFailoverEnabled: false,

  atRestEncryptionEnabled: true,
  transitEncryptionEnabled: true,

  snapshotRetentionLimit: 7,
  finalSnapshotIdentifier: 'penxle-final-snapshot',

  snapshotWindow: '19:00-20:00',
  maintenanceWindow: 'sun:20:00-sun:22:00',

  applyImmediately: true,
});
