import * as aws from '@pulumi/aws';

const penxleDevCertificate = new aws.acm.Certificate('penxle.dev', {
  domainName: 'penxle.dev',
  subjectAlternativeNames: ['*.penxle.dev'],
  validationMethod: 'DNS',
});

new aws.acm.CertificateValidation('penxle.dev', {
  certificateArn: penxleDevCertificate.arn,
});

export const certificates = {
  penxle_dev: penxleDevCertificate,
};

export const outputs = {
  AWS_ACM_PENXLE_DEV_CERTIFICATE_ARN: penxleDevCertificate.arn,
};
