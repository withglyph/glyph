import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import * as tls from '@pulumi/tls';
import { securityGroups, subnets, vpc } from '$aws/vpc';
import { tailnet } from '$tailscale/key';

const privateKey = new tls.PrivateKey('penxle@ec2/key-pair', {
  algorithm: 'ED25519',
});

new aws.ec2.KeyPair('penxle', {
  keyName: 'penxle',
  publicKey: privateKey.publicKeyOpenssh,
});

new aws.ec2.Instance('tailnet-vpc-router', {
  ami: aws.ec2.getAmiOutput({
    owners: ['amazon'],
    filters: [
      { name: 'name', values: ['al2023-ami-minimal-*'] },
      { name: 'architecture', values: ['arm64'] },
    ],
    mostRecent: true,
  }).id,

  instanceType: 't4g.nano',

  subnetId: subnets.private.az1.id,
  vpcSecurityGroupIds: [securityGroups.tailnet.id],

  userDataReplaceOnChange: true,
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
});

export const outputs = {
  AWS_EC2_KEY_PAIR_PENXLE_PRIVATE_KEY: privateKey.privateKeyOpenssh,
};
