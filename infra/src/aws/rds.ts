import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import { securityGroups, subnets } from '$aws/vpc';

// spell-checker:words serverlessv2

const password = new random.RandomPassword('penxle@rds', {
  length: 20,
  special: false,
});

const cluster = new aws.rds.Cluster('penxle', {
  clusterIdentifier: 'penxle',

  engine: 'aurora-postgresql',
  engineVersion: '15.3',

  dbSubnetGroupName: new aws.rds.SubnetGroup('private', {
    name: 'private',
    description: 'Private subnets',
    subnetIds: [subnets.private.az1.id, subnets.private.az2.id],
  }).name,
  vpcSecurityGroupIds: [securityGroups.interConnection.id],

  deletionProtection: true,
  storageEncrypted: true,

  backupRetentionPeriod: 7,
  finalSnapshotIdentifier: 'penxle-final-snapshot',

  preferredBackupWindow: '19:00-20:00',
  preferredMaintenanceWindow: 'sun:20:00-sun:22:00',

  masterUsername: 'root',
  masterPassword: password.result,

  applyImmediately: true,

  serverlessv2ScalingConfiguration: {
    minCapacity: 0.5,
    maxCapacity: 1,
  },
});

new aws.rds.ClusterInstance('penxle-1', {
  clusterIdentifier: cluster.id,
  identifier: 'penxle-1',

  engine: 'aurora-postgresql',

  instanceClass: 'db.serverless',

  promotionTier: 2,
  availabilityZone: subnets.private.az1.availabilityZone,

  performanceInsightsEnabled: true,
});

export const outputs = {
  connectionUrls: {
    penxle: pulumi.interpolate`postgresql://root:${password.result}@${cluster.endpoint}/penxle`,
  },
};
