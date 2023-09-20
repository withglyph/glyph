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
  vpcSecurityGroupIds: [securityGroups.public.id, securityGroups.internal.id],

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

new aws.ec2.Instance('tailscale-exit-node-az1', {
  ami: 'ami-034bd1a31f7fbf204', // Amazon Linux 2023 AMI 2023.1.20230809.0 arm64 HVM kernel-6.1
  instanceType: 't4g.nano',

  subnetId: subnets.private.az1.id,
  vpcSecurityGroupIds: [securityGroups.internal.id],

  keyName: keyPair.keyName,

  userDataReplaceOnChange: true,
  userData: pulumi.interpolate`
#cloud-config
runcmd:
  - [ hostnamectl, hostname, tailscale-exit-node-az1 ]
  - [ sh, -c, echo 'net.ipv4.ip_forward = 1' | tee -a /etc/sysctl.d/99-tailscale.conf ]
  - [ sysctl, -p, /etc/sysctl.d/99-tailscale.conf ]
  - [ sh, -c, curl -fsSL https://tailscale.com/install.sh | sh ]
  - [ tailscale, up, --auth-key=${tailnet.authKey} ]
  - [ tailscale, set, --advertise-exit-node ]
  - [ tailscale, set, --hostname=awsvpc-apne2-az1 ]
`.apply((v) => v.trim()),

  tags: { Name: 'tailscale-exit-node-az1' },
});

new aws.ec2.Instance('tailscale-exit-node-az2', {
  ami: 'ami-034bd1a31f7fbf204', // Amazon Linux 2023 AMI 2023.1.20230809.0 arm64 HVM kernel-6.1
  instanceType: 't4g.nano',

  subnetId: subnets.private.az2.id,
  vpcSecurityGroupIds: [securityGroups.internal.id],

  keyName: keyPair.keyName,

  userDataReplaceOnChange: true,
  userData: pulumi.interpolate`
#cloud-config
runcmd:
  - [ hostnamectl, hostname, tailscale-exit-node-az2 ]
  - [ sh, -c, echo 'net.ipv4.ip_forward = 1' | tee -a /etc/sysctl.d/99-tailscale.conf ]
  - [ sysctl, -p, /etc/sysctl.d/99-tailscale.conf ]
  - [ sh, -c, curl -fsSL https://tailscale.com/install.sh | sh ]
  - [ tailscale, up, --auth-key=${tailnet.authKey} ]
  - [ tailscale, set, --advertise-exit-node ]
  - [ tailscale, set, --hostname=awsvpc-apne2-az2 ]
`.apply((v) => v.trim()),

  tags: { Name: 'tailscale-exit-node-az2' },
});

const mixpanelProxy = new aws.ec2.Instance('mixpanel-proxy', {
  ami: 'ami-034bd1a31f7fbf204', // Amazon Linux 2023 AMI 2023.1.20230809.0 arm64 HVM kernel-6.1
  instanceType: 't4g.nano',

  subnetId: subnets.public.az1.id,
  vpcSecurityGroupIds: [securityGroups.public.id],

  keyName: keyPair.keyName,

  userDataReplaceOnChange: true,
  userData: pulumi.interpolate`
#cloud-config
packages:
  - nginx
runcmd:
  - [ hostnamectl, hostname, mixpanel-proxy ]
  - [ curl, -fsSL, https://raw.githubusercontent.com/mixpanel/tracking-proxy/master/nginx.conf, -o, /etc/nginx/nginx.conf ]
  - [ systemctl, enable, nginx ]
  - [ systemctl, restart, nginx ]
`.apply((v) => v.trim()),

  tags: { Name: 'mixpanel-proxy' },
});

new aws.ec2.Instance('datadog-agent', {
  ami: 'ami-034bd1a31f7fbf204', // Amazon Linux 2023 AMI 2023.1.20230809.0 arm64 HVM kernel-6.1
  instanceType: 't4g.nano',

  subnetId: subnets.private.az1.id,
  vpcSecurityGroupIds: [securityGroups.internal.id],

  keyName: keyPair.keyName,

  userDataReplaceOnChange: true,
  userData: pulumi.interpolate`
#cloud-config
runcmd:
  - [ hostnamectl, hostname, datadog-agent ]
`.apply((v) => v.trim()),

  tags: { Name: 'datadog-agent' },
});

export const instances = {
  mixpanelProxy,
  rdsPooler,
};

export const outputs = {
  AWS_EC2_KEY_PAIR_PENXLE_PRIVATE_KEY: privateKey.privateKeyOpenssh,
};
