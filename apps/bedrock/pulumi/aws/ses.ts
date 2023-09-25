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

export const outputs = {};
