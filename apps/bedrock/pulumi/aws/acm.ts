import * as aws from '@pulumi/aws';
import { zones } from '$aws/route53';

const createCertificate = (domain: string) => {
  const certificate = new aws.acm.Certificate(domain, {
    domainName: domain,
    subjectAlternativeNames: [`*.${domain}`],
    validationMethod: 'DNS',
  });

  certificate.domainValidationOptions.apply((options) => {
    for (const option of options) {
      if (option.domainName !== domain) {
        continue;
      }

      const name = option.resourceRecordName.slice(0, -1);

      new aws.route53.Record(name, {
        zoneId: zones[domain.replaceAll('.', '_') as keyof typeof zones].zoneId,
        type: option.resourceRecordType,
        name,
        records: [option.resourceRecordValue.slice(0, -1)],
        ttl: 300,
      });
    }
  });

  new aws.acm.CertificateValidation(domain, {
    certificateArn: certificate.arn,
  });

  return certificate;
};

export const certificates = {
  withglyph_com: createCertificate('withglyph.com'),
  withglyph_io: createCertificate('withglyph.io'),
  withglyph_dev: createCertificate('withglyph.dev'),
  glyph_pub: createCertificate('glyph.pub'),
  glph_to: createCertificate('glph.to'),
  pencil_so: createCertificate('pencil.so'),
  penxle_com: createCertificate('penxle.com'),
  penxle_io: createCertificate('penxle.io'),
  pnxl_co: createCertificate('pnxl.co'),
  pnxl_me: createCertificate('pnxl.me'),
};

export const outputs = {
  AWS_ACM_WITHGLYPH_COM_CERTIFICATE_ARN: certificates.withglyph_com.arn,
  AWS_ACM_WITHGLYPH_IO_CERTIFICATE_ARN: certificates.withglyph_io.arn,
  AWS_ACM_WITHGLYPH_DEV_CERTIFICATE_ARN: certificates.withglyph_dev.arn,
  AWS_ACM_GLYPH_PUB_CERTIFICATE_ARN: certificates.glyph_pub.arn,
  AWS_ACM_GLPH_TO_CERTIFICATE_ARN: certificates.glph_to.arn,

  AWS_ACM_PENCIL_SO_CERTIFICATE_ARN: certificates.pencil_so.arn,
  AWS_ACM_PENXLE_COM_CERTIFICATE_ARN: certificates.penxle_com.arn,
  AWS_ACM_PENXLE_IO_CERTIFICATE_ARN: certificates.penxle_io.arn,
  AWS_ACM_PNXL_CO_CERTIFICATE_ARN: certificates.pnxl_co.arn,
  AWS_ACM_PNXL_ME_CERTIFICATE_ARN: certificates.pnxl_me.arn,
};
