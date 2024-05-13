import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import * as tls from '@pulumi/tls';
import { securityGroups, subnets, vpc } from '$aws/vpc';
import { tailnet } from '$tailscale/key';
import { zones } from './route53';

const privateKey = new tls.PrivateKey('penxle@ec2/key-pair', {
  algorithm: 'ED25519',
});

const keypair = new aws.ec2.KeyPair('penxle', {
  keyName: 'penxle',
  publicKey: privateKey.publicKeyOpenssh,
});

new aws.ec2.Instance(
  'tailnet-vpc-router',
  {
    ami: aws.ec2.getAmiOutput({
      owners: ['amazon'],
      filters: [
        { name: 'name', values: ['al2023-ami-minimal-*'] },
        { name: 'architecture', values: ['arm64'] },
      ],
      mostRecent: true,
    }).id,

    instanceType: 't4g.nano',

    subnetId: subnets.public.az1.id,
    vpcSecurityGroupIds: [securityGroups.tailnet.id],

    sourceDestCheck: false,

    userData: pulumi.interpolate`
#cloud-config
runcmd:
  - [ hostnamectl, hostname, tailnet-vpc-router ]
  - [ sh, -c, echo 'net.ipv4.ip_forward = 1' | tee -a /etc/sysctl.d/99-tailscale.conf ]
  - [ sysctl, -p, /etc/sysctl.d/99-tailscale.conf ]
  - [ sh, -c, curl -fsSL https://tailscale.com/install.sh | sh ]
  - [ tailscale, up, --auth-key=${tailnet.authKey} ]
  - [ tailscale, set, --advertise-routes=${vpc.cidrBlock} ]
  - [ tailscale, set, --hostname=awsvpc-router ]
`.apply((v) => v.trim()),

    tags: { Name: 'tailnet-vpc-router' },
  },
  { ignoreChanges: ['ami'] },
);

const pgbouncer = new aws.ec2.Instance(
  'pgbouncer',
  {
    ami: aws.ec2.getAmiOutput({
      owners: ['amazon'],
      filters: [
        { name: 'name', values: ['al2023-ami-minimal-*'] },
        { name: 'architecture', values: ['arm64'] },
      ],
      mostRecent: true,
    }).id,

    instanceType: 'c7g.large',

    subnetId: subnets.private.az1.id,
    vpcSecurityGroupIds: [securityGroups.internal.id],

    sourceDestCheck: false,

    keyName: keypair.keyName,
    userData: pulumi.interpolate`
#cloud-config
runcmd:
  - [ hostnamectl, hostname, pgbouncer ]
`.apply((v) => v.trim()),

    tags: { Name: 'pgbouncer' },
  },
  { ignoreChanges: ['ami'] },
);

const bastion = new aws.ec2.Instance(
  'bastion',
  {
    ami: aws.ec2.getAmiOutput({
      owners: ['amazon'],
      filters: [
        { name: 'name', values: ['al2023-ami-minimal-*'] },
        { name: 'architecture', values: ['arm64'] },
      ],
      mostRecent: true,
    }).id,

    instanceType: 't4g.nano',

    subnetId: subnets.public.az1.id,
    vpcSecurityGroupIds: [securityGroups.bastion.id],

    keyName: keypair.keyName,
    userData: pulumi.interpolate`
#cloud-config
runcmd:
  - [ hostnamectl, hostname, bastion ]
`.apply((v) => v.trim()),

    tags: { Name: 'bastion' },
  },
  { ignoreChanges: ['ami'] },
);

new aws.route53.Record('bastion.withglyph.io', {
  zoneId: zones.withglyph_io.zoneId,
  name: 'bastion.withglyph.io',
  type: 'A',
  records: [bastion.publicIp],
  ttl: 300,
});

new aws.route53.Record('pool.db.withglyph.io', {
  zoneId: zones.withglyph_io.zoneId,
  name: 'pool.db.withglyph.io',
  type: 'A',
  records: [pgbouncer.privateIp],
  ttl: 300,
});

export const outputs = {
  AWS_EC2_KEY_PAIR_PENXLE_PRIVATE_KEY: privateKey.privateKeyOpenssh,
};
