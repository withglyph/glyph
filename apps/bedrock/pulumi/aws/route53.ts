// spell-checker:words amazonses aspmx

import * as aws from '@pulumi/aws';
import { alb } from '$aws/alb';
import { distributions } from '$aws/cloudfront';
import { instances } from '$aws/ec2';
import { elasticache } from '$aws/elasticache';
import { rds } from '$aws/rds';

const createZone = (domain: string) => {
  return new aws.route53.Zone(domain, {
    name: domain,
  });
};

export const zones = {
  penxle_com: createZone('penxle.com'),
  penxle_io: createZone('penxle.io'),
  pnxl_cc: createZone('pnxl.cc'),
  pnxl_co: createZone('pnxl.co'),
  pnxl_me: createZone('pnxl.me'),
  pnxl_net: createZone('pnxl.net'),
  pnxl_site: createZone('pnxl.site'),
};

new aws.route53.Record('penxle.com|txt', {
  zoneId: zones.penxle_com.zoneId,
  type: 'TXT',
  name: 'penxle.com',
  // spell-checker:disable-next-line
  records: ['google-site-verification=bwCGvefwzolnCCx3lMbeJ0VmSp9sawDrbcaQ2WgehJo'],
  ttl: 300,
});

new aws.route53.Record('channel._domainkey.penxle.com', {
  zoneId: zones.penxle_com.zoneId,
  type: 'CNAME',
  name: 'channel._domainkey.penxle.com',
  records: ['6534d2c4c57e777960a5.dkim.channel.io'],
  ttl: 300,
});

new aws.route53.Record('idea.penxle.com', {
  zoneId: zones.penxle_com.zoneId,
  type: 'CNAME',
  name: 'idea.penxle.com',
  records: ['cname.frill.co'],
  ttl: 300,
});

new aws.route53.Record('mail.penxle.com|mx', {
  zoneId: zones.penxle_com.zoneId,
  type: 'MX',
  name: 'mail.penxle.com',
  records: ['10 feedback-smtp.ap-northeast-2.amazonses.com'],
  ttl: 300,
});

new aws.route53.Record('mail.penxle.com|txt', {
  zoneId: zones.penxle_com.zoneId,
  type: 'TXT',
  name: 'mail.penxle.com',
  records: ['v=spf1 include:amazonses.com ~all'],
  ttl: 300,
});

new aws.route53.Record('status.penxle.com', {
  zoneId: zones.penxle_com.zoneId,
  type: 'CNAME',
  name: 'status.penxle.com',
  records: ['statuspage.betteruptime.com'],
  ttl: 300,
});

new aws.route53.Record('penxle.io|mx', {
  zoneId: zones.penxle_io.zoneId,
  type: 'MX',
  name: 'penxle.io',
  records: [
    '1 aspmx.l.google.com',
    '5 alt1.aspmx.l.google.com',
    '5 alt2.aspmx.l.google.com',
    '10 alt3.aspmx.l.google.com',
    '10 alt4.aspmx.l.google.com',
  ],
  ttl: 300,
});

new aws.route53.Record('penxle.io|txt', {
  zoneId: zones.penxle_io.zoneId,
  type: 'TXT',
  name: 'penxle.io',
  records: ['v=spf1 include:_spf.google.com ~all'],
  ttl: 300,
});

new aws.route53.Record('db.pnxl.co', {
  zoneId: zones.pnxl_co.zoneId,
  type: 'CNAME',
  name: 'db.pnxl.co',
  records: [rds.cluster.endpoint],
  ttl: 300,
});

new aws.route53.Record('reader.db.pnxl.co', {
  zoneId: zones.pnxl_co.zoneId,
  type: 'CNAME',
  name: 'reader.db.pnxl.co',
  records: [rds.cluster.readerEndpoint],
  ttl: 300,
});

new aws.route53.Record('pool.db.pnxl.co', {
  zoneId: zones.pnxl_co.zoneId,
  type: 'A',
  name: 'pool.db.pnxl.co',
  records: [instances.rdsPooler.privateIp],
  ttl: 300,
});

new aws.route53.Record('redis.pnxl.co', {
  zoneId: zones.pnxl_co.zoneId,
  type: 'CNAME',
  name: 'redis.pnxl.co',
  records: [elasticache.cluster.primaryEndpointAddress],
  ttl: 300,
});

new aws.route53.Record('x.pnxl.co', {
  zoneId: zones.pnxl_co.zoneId,
  type: 'A',
  name: 'x.pnxl.co',
  aliases: [
    {
      name: alb.mixpanel.dnsName,
      zoneId: alb.mixpanel.zoneId,
      evaluateTargetHealth: false,
    },
  ],
});

new aws.route53.Record('pnxl.net', {
  zoneId: zones.pnxl_net.zoneId,
  type: 'A',
  name: 'pnxl.net',
  aliases: [
    {
      name: distributions.pnxl_net.domainName,
      zoneId: distributions.pnxl_net.hostedZoneId,
      evaluateTargetHealth: false,
    },
  ],
});

new aws.route53.Record('c.pnxl.net', {
  zoneId: zones.pnxl_net.zoneId,
  type: 'CNAME',
  name: 'c.pnxl.net',
  records: ['penxle-data.b-cdn.net'],
  ttl: 300,
});
