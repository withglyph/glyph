import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import { zones } from '$aws/route53';
import { securityGroups, subnets } from '$aws/vpc';

const password = new random.RandomPassword('penxle@rds', {
  length: 20,
});

const devPassword = new random.RandomPassword('penxle-dev@rds', {
  length: 20,
});

const monitoring = new aws.iam.Role('monitoring@rds', {
  name: 'monitoring@rds',
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: 'monitoring.rds.amazonaws.com',
  }),
  managedPolicyArns: [aws.iam.ManagedPolicy.AmazonRDSEnhancedMonitoringRole],
});

const subnetGroup = new aws.rds.SubnetGroup('private', {
  name: 'private',
  description: 'Private subnets',
  subnetIds: [subnets.private.az1.id, subnets.private.az2.id],
});

const cluster = new aws.rds.Cluster('penxle', {
  clusterIdentifier: 'penxle',

  engine: 'aurora-postgresql',
  engineMode: 'provisioned',
  engineVersion: '15.4',

  dbSubnetGroupName: subnetGroup.name,
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

const devCluster = new aws.rds.Cluster('penxle-dev', {
  clusterIdentifier: 'penxle-dev',

  engine: 'aurora-postgresql',
  engineMode: 'provisioned',
  engineVersion: '15.4',

  dbSubnetGroupName: subnetGroup.name,
  vpcSecurityGroupIds: [securityGroups.internal.id],

  deletionProtection: true,
  storageEncrypted: true,

  backupRetentionPeriod: 7,
  finalSnapshotIdentifier: 'penxle-dev-final-snapshot',

  preferredBackupWindow: '19:00-20:00',
  preferredMaintenanceWindow: 'sun:20:00-sun:22:00',

  masterUsername: 'root',
  masterPassword: devPassword.result,

  applyImmediately: true,
});

new aws.rds.ClusterInstance('penxle-dev-1', {
  clusterIdentifier: devCluster.id,
  identifier: 'penxle-dev-1',

  engine: 'aurora-postgresql',
  instanceClass: 'db.t4g.medium',

  availabilityZone: subnets.private.az1.availabilityZone,
  caCertIdentifier: 'rds-ca-rsa2048-g1',

  preferredMaintenanceWindow: 'sun:20:00-sun:22:00',

  monitoringInterval: 0,
  performanceInsightsEnabled: false,

  promotionTier: 0,

  applyImmediately: true,
});

new aws.route53.Record('db.pnxl.co', {
  zoneId: zones.pnxl_co.zoneId,
  type: 'CNAME',
  name: 'db.pnxl.co',
  records: [cluster.endpoint],
  ttl: 300,
});

new aws.route53.Record('dev.db.pnxl.co', {
  zoneId: zones.pnxl_co.zoneId,
  type: 'CNAME',
  name: 'dev.db.pnxl.co',
  records: [devCluster.endpoint],
  ttl: 300,
});

export const rds = {
  instance,
};

export const outputs = {
  AWS_RDS_PENXLE_CONNECTION_URL: pulumi.interpolate`postgresql://root:${password.result}@${cluster.endpoint}`,
  AWS_RDS_PENXLE_DEV_CONNECTION_URL: pulumi.interpolate`postgresql://root:${devPassword.result}@${devCluster.endpoint}`,
};
