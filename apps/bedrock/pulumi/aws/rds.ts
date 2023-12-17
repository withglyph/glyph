import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import { securityGroups, subnets } from '$aws/vpc';

const password = new random.RandomPassword('penxle@rds', {
  length: 20,
});

const monitoring = new aws.iam.Role('monitoring@rds', {
  name: 'monitoring@rds',
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: 'monitoring.rds.amazonaws.com',
  }),
  managedPolicyArns: [aws.iam.ManagedPolicy.AmazonRDSEnhancedMonitoringRole],
});

const cluster = new aws.rds.Cluster('penxle', {
  clusterIdentifier: 'penxle',

  engine: 'aurora-postgresql',
  engineMode: 'provisioned',
  engineVersion: '15.4',

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

const instance = new aws.rds.ClusterInstance('penxle-1', {
  clusterIdentifier: cluster.id,
  identifier: 'penxle-1',

  engine: 'aurora-postgresql',
  instanceClass: 'db.r6g.large',

  availabilityZone: subnets.private.az1.availabilityZone,
  caCertIdentifier: 'rds-ca-rsa2048-g1',

  preferredMaintenanceWindow: 'sun:20:00-sun:22:00',

  monitoringInterval: 60,
  monitoringRoleArn: monitoring.arn,
  performanceInsightsEnabled: true,

  promotionTier: 0,

  applyImmediately: true,
});

export const rds = {
  cluster,
  instance,
};

export const outputs = {
  AWS_RDS_PENXLE_CONNECTION_URL: pulumi.interpolate`postgresql://root:${password.result}@${cluster.endpoint}`,
};
