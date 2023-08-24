import * as aws from '@pulumi/aws';

const vpc = new aws.ec2.Vpc('penxle', {
  cidrBlock: '10.0.0.0/16',
  enableDnsHostnames: true,
  tags: { Name: 'penxle' },
});

const publicAz1Subnet = new aws.ec2.Subnet('public-az1', {
  vpcId: vpc.id,
  availabilityZone: 'ap-northeast-2a',
  cidrBlock: '10.0.100.0/22',
  mapPublicIpOnLaunch: true,
  tags: { Name: 'public-az1' },
});

const publicAz2Subnet = new aws.ec2.Subnet('public-az2', {
  vpcId: vpc.id,
  availabilityZone: 'ap-northeast-2b',
  cidrBlock: '10.0.104.0/22',
  mapPublicIpOnLaunch: true,
  tags: { Name: 'public-az2' },
});

const privateAz1Subnet = new aws.ec2.Subnet('private-az1', {
  vpcId: vpc.id,
  availabilityZone: 'ap-northeast-2a',
  cidrBlock: '10.0.200.0/22',
  tags: { Name: 'private-az1' },
});

const privateAz2Subnet = new aws.ec2.Subnet('private-az2', {
  vpcId: vpc.id,
  availabilityZone: 'ap-northeast-2b',
  cidrBlock: '10.0.204.0/22',
  tags: { Name: 'private-az2' },
});

const publicRouteTable = new aws.ec2.RouteTable('public', {
  vpcId: vpc.id,
  routes: [
    {
      cidrBlock: '0.0.0.0/0',
      gatewayId: new aws.ec2.InternetGateway('public', {
        vpcId: vpc.id,
        tags: { Name: 'public' },
      }).id,
    },
  ],
  tags: { Name: 'public' },
});

new aws.ec2.RouteTableAssociation('public-az1', {
  subnetId: publicAz1Subnet.id,
  routeTableId: publicRouteTable.id,
});

new aws.ec2.RouteTableAssociation('public-az2', {
  subnetId: publicAz2Subnet.id,
  routeTableId: publicRouteTable.id,
});

new aws.ec2.RouteTableAssociation('private-az1', {
  subnetId: privateAz1Subnet.id,
  routeTableId: new aws.ec2.RouteTable('private-az1', {
    vpcId: vpc.id,
    routes: [
      {
        cidrBlock: '0.0.0.0/0',
        natGatewayId: new aws.ec2.NatGateway('az1', {
          subnetId: publicAz1Subnet.id,
          allocationId: new aws.ec2.Eip('natgw-az1', {
            tags: { Name: 'natgw-az1' },
          }).id,
          tags: { Name: 'az1' },
        }).id,
      },
    ],
    tags: { Name: 'private-az1' },
  }).id,
});

new aws.ec2.RouteTableAssociation('private-az2', {
  subnetId: privateAz2Subnet.id,
  routeTableId: new aws.ec2.RouteTable('private-az2', {
    vpcId: vpc.id,
    routes: [
      {
        cidrBlock: '0.0.0.0/0',
        natGatewayId: new aws.ec2.NatGateway('az2', {
          subnetId: publicAz2Subnet.id,
          allocationId: new aws.ec2.Eip('natgw-az2', {
            tags: { Name: 'natgw-az2' },
          }).id,
          tags: { Name: 'az2' },
        }).id,
      },
    ],
    tags: { Name: 'private-az2' },
  }).id,
});

const publicSecurityGroup = new aws.ec2.SecurityGroup('public', {
  name: 'public',
  description: 'Open to the world',
  vpcId: vpc.id,

  ingress: [
    {
      protocol: 'all',
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ['0.0.0.0/0'],
    },
  ],

  egress: [
    {
      protocol: '-1',
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ['0.0.0.0/0'],
    },
  ],

  tags: { Name: 'public' },
});

const privateSecurityGroup = new aws.ec2.SecurityGroup('private', {
  name: 'private',
  description: 'Not open to the world',
  vpcId: vpc.id,

  egress: [
    {
      protocol: '-1',
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ['0.0.0.0/0'],
    },
  ],

  tags: { Name: 'private' },
});

const interConnectionSecurityGroup = new aws.ec2.SecurityGroup(
  'inter-connection',
  {
    name: 'inter-connection',
    description: 'Connection between services',
    vpcId: vpc.id,

    ingress: [
      {
        protocol: 'all',
        fromPort: 0,
        toPort: 0,
        self: true,
      },
    ],

    egress: [
      {
        protocol: '-1',
        fromPort: 0,
        toPort: 0,
        cidrBlocks: ['0.0.0.0/0'],
      },
    ],

    tags: { Name: 'inter-connection' },
  },
);

export { vpc };

export const subnets = {
  public: { az1: publicAz1Subnet, az2: publicAz2Subnet },
  private: { az1: privateAz1Subnet, az2: privateAz2Subnet },
};

export const securityGroups = {
  public: publicSecurityGroup,
  private: privateSecurityGroup,
  interConnection: interConnectionSecurityGroup,
};

export const outputs = {};
