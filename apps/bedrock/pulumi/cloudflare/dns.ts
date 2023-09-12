import * as cloudflare from '@pulumi/cloudflare';
import { certificates } from '$aws/acm';
import { instances } from '$aws/ec2';
import { rds } from '$aws/rds';
import { awsSesDkimTokens } from '$aws/ses';
import { zones } from '$cloudflare/zone';

// spell-checker:words amazonses aspmx

for (const [domain, tokens] of Object.entries(awsSesDkimTokens)) {
  tokens.apply((tokens) => {
    for (const token of tokens) {
      const zone = zones[domain as keyof typeof zones];
      zone.zone.apply((zone) => {
        new cloudflare.Record(`${token}._domainkey.${zone}`, {
          zoneId: zones[domain as keyof typeof zones].id,
          type: 'CNAME',
          name: `${token}._domainkey.${zone}`,
          value: `${token}.dkim.amazonses.com`,
          comment: 'Amazon SES',
        });
      });
    }
  });
}

for (const [domain, certificate] of Object.entries(certificates)) {
  const created = new Set<string>();
  certificate.domainValidationOptions.apply((options) => {
    for (const option of options) {
      const name = option.resourceRecordName.slice(0, -1);
      if (created.has(name)) {
        continue;
      }

      new cloudflare.Record(name, {
        zoneId: zones[domain as keyof typeof zones].id,
        type: option.resourceRecordType,
        name,
        value: option.resourceRecordValue.slice(0, -1),
        comment: 'AWS Certificate Manager',
      });

      created.add(name);
    }
  });
}

new cloudflare.Record('idea.penxle.com', {
  zoneId: zones.penxle_com.id,
  type: 'CNAME',
  name: 'idea.penxle.com',
  value: 'cname.frill.co',
  comment: 'Frill',
});

new cloudflare.Record('status.penxle.com', {
  zoneId: zones.penxle_com.id,
  type: 'CNAME',
  name: 'status.penxle.com',
  value: 'statuspage.betteruptime.com',
  comment: 'Better Stack (Uptime)',
});

new cloudflare.Record('www.penxle.com', {
  zoneId: zones.penxle_com.id,
  type: 'AAAA',
  name: 'www.penxle.com',
  value: '100::',
  proxied: true,
  comment: 'Cloudflare (Page Rules)',
});

new cloudflare.Record('penxle.com,txt=gsv', {
  zoneId: zones.penxle_com.id,
  type: 'TXT',
  name: 'penxle.com',
  // spell-checker:disable-next-line
  value: 'google-site-verification=bwCGvefwzolnCCx3lMbeJ0VmSp9sawDrbcaQ2WgehJo',
  comment: 'Google Search Console',
});

new cloudflare.Record('mail.penxle.com,mx=10', {
  zoneId: zones.penxle_com.id,
  type: 'MX',
  name: 'mail.penxle.com',
  value: 'feedback-smtp.ap-northeast-2.amazonses.com',
  priority: 10,
  comment: 'Amazon SES',
});

new cloudflare.Record('mail.penxle.com,txt=spf', {
  zoneId: zones.penxle_com.id,
  type: 'TXT',
  name: 'mail.penxle.com',
  value: 'v=spf1 include:amazonses.com ~all',
  comment: 'Amazon SES',
});

new cloudflare.Record('www.penxle.io', {
  zoneId: zones.penxle_io.id,
  type: 'AAAA',
  name: 'www.penxle.io',
  value: '100::',
  proxied: true,
  comment: 'Cloudflare (Page Rules)',
});

new cloudflare.Record('mail.penxle.io', {
  zoneId: zones.penxle_io.id,
  type: 'CNAME',
  name: 'mail.penxle.io',
  value: 'ghs.googlehosted.com',
  comment: 'Google Workspace',
});

new cloudflare.Record('penxle.io,mx=1', {
  zoneId: zones.penxle_io.id,
  type: 'MX',
  name: 'penxle.io',
  value: 'aspmx.l.google.com',
  priority: 1,
  comment: 'Google Workspace',
});

new cloudflare.Record('penxle.io,mx=5_1', {
  zoneId: zones.penxle_io.id,
  type: 'MX',
  name: 'penxle.io',
  value: 'alt1.aspmx.l.google.com',
  priority: 5,
  comment: 'Google Workspace',
});

new cloudflare.Record('penxle.io,mx=5_2', {
  zoneId: zones.penxle_io.id,
  type: 'MX',
  name: 'penxle.io',
  value: 'alt2.aspmx.l.google.com',
  priority: 5,
  comment: 'Google Workspace',
});

new cloudflare.Record('penxle.io,mx=10_1', {
  zoneId: zones.penxle_io.id,
  type: 'MX',
  name: 'penxle.io',
  value: 'alt3.aspmx.l.google.com',
  priority: 10,
  comment: 'Google Workspace',
});

new cloudflare.Record('penxle.io,mx=10_2', {
  zoneId: zones.penxle_io.id,
  type: 'MX',
  name: 'penxle.io',
  value: 'alt4.aspmx.l.google.com',
  priority: 10,
  comment: 'Google Workspace',
});

new cloudflare.Record('penxle.io,txt=spf', {
  zoneId: zones.penxle_io.id,
  type: 'TXT',
  name: 'penxle.io',
  value: 'v=spf1 include:_spf.google.com ~all',
  comment: 'Google Workspace',
});

new cloudflare.Record('pnxl.cc', {
  zoneId: zones.pnxl_cc.id,
  type: 'AAAA',
  name: 'pnxl.cc',
  value: '100::',
  proxied: true,
  comment: 'Cloudflare (Redirect Rules)',
});

new cloudflare.Record('db.pnxl.co', {
  zoneId: zones.pnxl_co.id,
  type: 'CNAME',
  name: 'db.pnxl.co',
  value: rds.cluster.endpoint,
  comment: 'Amazon RDS',
});

new cloudflare.Record('reader.db.pnxl.co', {
  zoneId: zones.pnxl_co.id,
  type: 'CNAME',
  name: 'reader.db.pnxl.co',
  value: rds.cluster.readerEndpoint,
  comment: 'Amazon RDS',
});

new cloudflare.Record('pool.db.pnxl.co', {
  zoneId: zones.pnxl_co.id,
  type: 'A',
  name: 'pool.db.pnxl.co',
  value: instances.rdsPooler.privateIp,
  comment: 'Amazon EC2',
});

new cloudflare.Record('c.pnxl.net', {
  zoneId: zones.pnxl_net.id,
  type: 'CNAME',
  name: 'c.pnxl.net',
  value: 'penxle-data.b-cdn.net',
  comment: 'bunny.net',
});

new cloudflare.Record('t.pnxl.net', {
  zoneId: zones.pnxl_net.id,
  type: 'A',
  name: 't.pnxl.net',
  value: instances.mixpanelProxy.publicIp,
  proxied: true,
  comment: 'Amazon EC2',
});

export const outputs = {};
