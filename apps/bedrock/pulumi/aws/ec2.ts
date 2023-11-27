import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import * as tls from '@pulumi/tls';
import { securityGroups, subnets, vpc } from '$aws/vpc';
import { tailnet } from '$tailscale/key';

const privateKey = new tls.PrivateKey('penxle@ec2/key-pair', {
  algorithm: 'ED25519',
});

const keyPair = new aws.ec2.KeyPair('penxle', {
  keyName: 'penxle',
  publicKey: privateKey.publicKeyOpenssh,
});

const rdsPooler = new aws.ec2.Instance('rds-pooler', {
  ami: 'ami-034bd1a31f7fbf204', // Amazon Linux 2023 AMI 2023.1.20230809.0 arm64 HVM kernel-6.1
  instanceType: 't4g.nano',

  subnetId: subnets.private.az1.id,
  vpcSecurityGroupIds: [securityGroups.internal.id],

  keyName: keyPair.keyName,

  userDataReplaceOnChange: true,
  userData: pulumi.interpolate`
#cloud-config
runcmd:
  - [ hostnamectl, hostname, rds-pooler ]
`.apply((v) => v.trim()),

  tags: { Name: 'rds-pooler' },
});

new aws.ec2.Instance('tailscale-subnet-router', {
  ami: 'ami-034bd1a31f7fbf204', // Amazon Linux 2023 AMI 2023.1.20230809.0 arm64 HVM kernel-6.1

  instanceType: 't4g.nano',

  subnetId: subnets.public.az1.id,
  vpcSecurityGroupIds: [securityGroups.public.id, securityGroups.internal.id, securityGroups.tailnet.id],

  keyName: keyPair.keyName,

  userDataReplaceOnChange: true,
  userData: pulumi.interpolate`
#cloud-config
runcmd:
  - [ hostnamectl, hostname, tailscale-subnet-router ]
  - [ sh, -c, echo 'net.ipv4.ip_forward = 1' | tee -a /etc/sysctl.d/99-tailscale.conf ]
  - [ sysctl, -p, /etc/sysctl.d/99-tailscale.conf ]
  - [ sh, -c, curl -fsSL https://tailscale.com/install.sh | sh ]
  - [ tailscale, up, --auth-key=${tailnet.authKey} ]
  - [ tailscale, set, --advertise-routes=${vpc.cidrBlock} ]
  - [ tailscale, set, --hostname=awsvpc-router ]
`.apply((v) => v.trim()),

  tags: { Name: 'tailscale-subnet-router' },
});

export const instances = {
  rdsPooler,
};

export const outputs = {
  AWS_EC2_KEY_PAIR_PENXLE_PRIVATE_KEY: privateKey.privateKeyOpenssh,
};
