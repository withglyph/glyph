import * as aws from '@pulumi/aws';
import { zones } from '$aws/route53';

// spell-checker:words sesv2

const configurationSet = new aws.sesv2.ConfigurationSet('withglyph.com', {
  configurationSetName: 'withglyph_com',
});

const emailIdentity = new aws.sesv2.EmailIdentity('withglyph.com', {
  emailIdentity: 'withglyph.com',
  configurationSetName: configurationSet.configurationSetName,
});

new aws.sesv2.EmailIdentityMailFromAttributes('withglyph.com', {
  emailIdentity: emailIdentity.id,
  mailFromDomain: 'mail.withglyph.com',
});

emailIdentity.dkimSigningAttributes.tokens.apply((tokens) => {
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
