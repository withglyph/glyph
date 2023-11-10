import * as aws from '@pulumi/aws';
import { certificates } from '$aws/acm';
import { instances } from '$aws/ec2';
import { securityGroups, subnets, vpc } from '$aws/vpc';

const mixpanelTargetGroup = new aws.alb.TargetGroup('mixpanel-proxy', {
  name: 'mixpanel-proxy',

  vpcId: vpc.id,
  targetType: 'instance',
  protocol: 'HTTP',
  port: 80,

  healthCheck: {
    matcher: '404',
  },
});

new aws.alb.TargetGroupAttachment('mixpanel-proxy', {
  targetGroupArn: mixpanelTargetGroup.arn,
  targetId: instances.mixpanel.id,
});

const mixpanelLoadBalancer = new aws.alb.LoadBalancer('mixpanel-proxy', {
  name: 'mixpanel-proxy',

  subnets: [subnets.public.az1.id, subnets.public.az2.id],
  securityGroups: [securityGroups.public.id],
});

new aws.alb.Listener('mixpanel-proxy', {
  loadBalancerArn: mixpanelLoadBalancer.arn,

  protocol: 'HTTPS',
  port: 443,
  sslPolicy: 'ELBSecurityPolicy-TLS13-1-2-2021-06',
  certificateArn: certificates.pnxl_co.arn,

  defaultActions: [
    {
      type: 'forward',
      targetGroupArn: mixpanelTargetGroup.arn,
    },
  ],
});

export const alb = {
  mixpanel: mixpanelLoadBalancer,
};
