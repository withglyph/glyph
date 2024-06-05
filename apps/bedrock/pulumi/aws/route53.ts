import * as aws from '@pulumi/aws';

const createZone = (domain: string) => {
  return new aws.route53.Zone(domain, {
    name: domain,
  });
};

export const zones = {
  withglyph_com: createZone('withglyph.com'),
  withglyph_io: createZone('withglyph.io'),
  withglyph_dev: createZone('withglyph.dev'),
  glyph_pub: createZone('glyph.pub'),
  glph_to: createZone('glph.to'),
  pencil_so: createZone('pencil.so'),
  penxle_com: createZone('penxle.com'),
  penxle_io: createZone('penxle.io'),
  pnxl_co: createZone('pnxl.co'),
  pnxl_me: createZone('pnxl.me'),
  pnxl_net: createZone('pnxl.net'),
};

new aws.route53.Record('withglyph.com|mx', {
  zoneId: zones.withglyph_com.zoneId,
  type: 'MX',
  name: 'withglyph.com',
  records: ['1 smtp.google.com'],
  ttl: 300,
});

new aws.route53.Record('withglyph.com|txt', {
  zoneId: zones.withglyph_com.zoneId,
  type: 'TXT',
  name: 'withglyph.com',
  records: [
    // spell-checker:disable-next-line
    'google-site-verification=lWwP2X_Hg6WkFmykY1WBebezvqKK2hiZRqECoP92zMQ',
    'v=spf1 include:_spf.google.com ~all',
  ],
  ttl: 300,
});

new aws.route53.Record('mail.withglyph.com|mx', {
  zoneId: zones.withglyph_com.zoneId,
  type: 'MX',
  name: 'mail.withglyph.com',
  records: ['10 feedback-smtp.ap-northeast-2.amazonses.com'],
  ttl: 300,
});

new aws.route53.Record('mail.withglyph.com|txt', {
  zoneId: zones.withglyph_com.zoneId,
  type: 'TXT',
  name: 'mail.withglyph.com',
  records: ['v=spf1 include:amazonses.com ~all'],
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

new aws.route53.Record('channel._domainkey.penxle.com', {
  zoneId: zones.penxle_com.zoneId,
  type: 'CNAME',
  name: 'channel._domainkey.penxle.com',
  records: ['6534d2c4c57e777960a5.dkim.channel.io'],
  ttl: 300,
});

new aws.route53.Record('feedback.penxle.com', {
  zoneId: zones.penxle_com.zoneId,
  type: 'CNAME',
  name: 'feedback.penxle.com',
  records: ['custom-domain.nolt.io'],
  ttl: 300,
});

new aws.route53.Record('penxle.io|mx', {
  zoneId: zones.penxle_io.zoneId,
  type: 'MX',
  name: 'penxle.io',
  records: ['1 smtp.google.com'],
  ttl: 300,
});

new aws.route53.Record('penxle.io|txt', {
  zoneId: zones.penxle_io.zoneId,
  type: 'TXT',
  name: 'penxle.io',
  records: [
    'v=spf1 include:_spf.google.com ~all',
    'google-site-verification=tpr1g3VFKecYSsdN12t9DhRGUBbaAxEhi1LupBHHq6I',
  ],
  ttl: 300,
});

new aws.route53.Record('pencil.so|txt', {
  zoneId: zones.pencil_so.zoneId,
  type: 'TXT',
  name: 'pencil.so',
  // spell-checker:disable-next-line
  records: ['google-site-verification=7lMNJhce63je2LK5iw8ZzBFh34dMrjjS2IfRDd06Sm0'],
  ttl: 300,
});
