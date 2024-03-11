// spell-checker:words amazonses aspmx

import * as aws from '@pulumi/aws';

const createZone = (domain: string) => {
  return new aws.route53.Zone(domain, {
    name: domain,
  });
};

export const zones = {
  glyph_space: createZone('glyph.space'),
  glyph_ninja: createZone('glyph.ninja'),
  glyphcdn_com: createZone('glyphcdn.com'),
  glph_to: createZone('glph.to'),
  pencil_so: createZone('pencil.so'),
  penxle_com: createZone('penxle.com'),
  penxle_io: createZone('penxle.io'),
  pnxl_co: createZone('pnxl.co'),
  pnxl_me: createZone('pnxl.me'),
  pnxl_net: createZone('pnxl.net'),
};

new aws.route53.Record('pencil.so|txt', {
  zoneId: zones.pencil_so.zoneId,
  type: 'TXT',
  name: 'pencil.so',
  // spell-checker:disable-next-line
  records: ['google-site-verification=7lMNJhce63je2LK5iw8ZzBFh34dMrjjS2IfRDd06Sm0'],
  ttl: 300,
});

new aws.route53.Record('penxle.com|txt', {
  zoneId: zones.penxle_com.zoneId,
  type: 'TXT',
  name: 'penxle.com',
  // spell-checker:disable-next-line
  records: ['google-site-verification=bwCGvefwzolnCCx3lMbeJ0VmSp9sawDrbcaQ2WgehJo'],
  ttl: 300,
});

new aws.route53.Record('_atproto.penxle.com|txt', {
  zoneId: zones.penxle_com.zoneId,
  type: 'TXT',
  name: '_atproto.penxle.com',
  // spell-checker:disable-next-line
  records: ['did=did:plc:ny3tz5doox6cp3a37juqcgnj'],
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

new aws.route53.Record('feedback.penxle.com', {
  zoneId: zones.penxle_com.zoneId,
  type: 'CNAME',
  name: 'feedback.penxle.com',
  records: ['custom-domain.nolt.io'],
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
