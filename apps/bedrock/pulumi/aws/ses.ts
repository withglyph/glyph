import * as aws from '@pulumi/aws';

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

export const awsSesDkimTokens = {
  penxle_com: emailIdentity.dkimSigningAttributes.tokens,
};

export const outputs = {};
