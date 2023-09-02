import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import { securityGroups, subnets } from '$aws/vpc';

const password = new random.RandomPassword('penxle@rds', {
  length: 20,
});

const cluster = new aws.rds.Cluster('penxle', {
  clusterIdentifier: 'penxle',

  engine: 'aurora-postgresql',
  engineMode: 'provisioned',
  engineVersion: '15.3',

  dbSubnetGroupName: new aws.rds.SubnetGroup('private', {
    name: 'private',
    description: 'Private subnets',
    subnetIds: [subnets.private.az1.id, subnets.private.az2.id],
  }).name,
  vpcSecurityGroupIds: [securityGroups.internal.id],

  deletionProtection: true,
  storageEncrypted: true,

  backupRetentionPeriod: 7,
  finalSnapshotIdentifier: 'penxle-final-snapshot',

  preferredBackupWindow: '19:00-20:00',
  preferredMaintenanceWindow: 'sun:20:00-sun:22:00',

  masterUsername: 'root',
  masterPassword: password.result,

  applyImmediately: true,
});

new aws.rds.ClusterInstance('penxle-1', {
  clusterIdentifier: cluster.id,
  identifier: 'penxle-1',

  engine: 'aurora-postgresql',
  instanceClass: 'db.t4g.medium',

  availabilityZone: subnets.private.az1.availabilityZone,
  caCertIdentifier: 'rds-ca-rsa2048-g1',

  preferredMaintenanceWindow: 'sun:20:00-sun:22:00',

  performanceInsightsEnabled: true,

  promotionTier: 0,

  applyImmediately: true,
});

export const rds = {
  cluster,
};

export const outputs = {
  AWS_RDS_PENXLE_CONNECTION_URL: pulumi.interpolate`postgresql://root:${password.result}@${cluster.endpoint}/penxle`,
};
