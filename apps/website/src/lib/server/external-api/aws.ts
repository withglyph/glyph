import { S3Client } from '@aws-sdk/client-s3';
import { SESClient } from '@aws-sdk/client-ses';
import { init } from '@paralleldrive/cuid2';
import dayjs from 'dayjs';

export const s3 = new S3Client();
export const ses = new SESClient();

const createId = init({ length: 16 });

export const createS3ObjectKey = (prefix: string) => {
  const now = dayjs();
  const year = now.format('YY');
  const month = now.format('MM');

  const key = createId();
  const fragment = key[0];
  const subfragment = `${fragment}${key[1]}`;

  return `${prefix}/${year}/${month}/${fragment}/${subfragment}/${key}`;
};
