import * as aws from '@pulumi/aws';
import { zones } from '$aws/route53';

// spell-checker:words sesv2

const configurationSet = new aws.sesv2.ConfigurationSet('penxle.com', {
  configurationSetName: 'penxle_com',
});

const emailIdentity = new aws.sesv2.EmailIdentity('penxle.com', {
  emailIdentity: 'penxle.com',
  configurationSetName: configurationSet.configurationSetName,
});

new aws.sesv2.EmailIdentityMailFromAttributes('penxle.com', {
  emailIdentity: emailIdentity.id,
  mailFromDomain: 'mail.penxle.com',
});

emailIdentity.dkimSigningAttributes.tokens.apply((tokens) => {
  for (const token of tokens) {
    new aws.route53.Record(`${token}._domainkey.penxle.com`, {
      zoneId: zones.penxle_com.zoneId,
      type: 'CNAME',
      name: `${token}._domainkey.penxle.com`,
      records: [`${token}.dkim.amazonses.com`],
      ttl: 300,
    });
  }
});

const configurationSet2 = new aws.sesv2.ConfigurationSet('withglyph.com', {
  configurationSetName: 'withglyph_com',
});

const emailIdentity2 = new aws.sesv2.EmailIdentity('withglyph.com', {
  emailIdentity: 'withglyph.com',
  configurationSetName: configurationSet2.configurationSetName,
});

new aws.sesv2.EmailIdentityMailFromAttributes('withglyph.com', {
  emailIdentity: emailIdentity2.id,
  mailFromDomain: 'mail.withglyph.com',
});

emailIdentity2.dkimSigningAttributes.tokens.apply((tokens) => {
  for (const token of tokens) {
    new aws.route53.Record(`${token}._domainkey.withglyph.com`, {
      zoneId: zones.withglyph_com.zoneId,
      type: 'CNAME',
      name: `${token}._domainkey.withglyph.com`,
      records: [`${token}.dkim.amazonses.com`],
      ttl: 300,
    });
  }
});

export const outputs = {};
