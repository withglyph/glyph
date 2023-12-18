// spell-checker:words amazonses aspmx

import * as aws from '@pulumi/aws';

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
