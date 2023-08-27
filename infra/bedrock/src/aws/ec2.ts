import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import * as tls from '@pulumi/tls';
import { securityGroups, subnets, vpc } from '$aws/vpc';

const privateKey = new tls.PrivateKey('penxle@ec2-keypair', {
  algorithm: 'ED25519',
});

const keypair = new aws.ec2.KeyPair('penxle', {
  keyName: 'penxle',
  publicKey: privateKey.publicKeyOpenssh,
});

new aws.ec2.Instance('tailscale-vpc-router', {
  ami: 'ami-034bd1a31f7fbf204', // Amazon Linux 2023 AMI 2023.1.20230809.0 arm64 HVM kernel-6.1
  instanceType: 't4g.nano',

  subnetId: subnets.public.az1.id,
  vpcSecurityGroupIds: [securityGroups.public.id, securityGroups.internal.id],

  keyName: keypair.keyName,
  userData: pulumi.interpolate`
#!/bin/bash
hostnamectl hostname tailscale-vpc-router
echo 'net.ipv4.ip_forward = 1' | tee -a /etc/sysctl.d/99-tailscale.conf
sysctl -p /etc/sysctl.d/99-tailscale.conf
curl -fsSL https://tailscale.com/install.sh | sh
tailscale set --advertise-routes='${vpc.cidrBlock}'
`.apply((v) => v.trim()),

  tags: { Name: 'tailscale-vpc-router' },
});

export const outputs = {
  AWS_EC2_PENXLE_KEYPAIR_PRIVATE_KEY: privateKey.privateKeyOpenssh,
};
