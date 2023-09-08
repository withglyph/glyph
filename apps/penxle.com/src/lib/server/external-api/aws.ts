import { S3Client } from '@aws-sdk/client-s3';
import { SESClient } from '@aws-sdk/client-ses';
import { nanoid } from 'nanoid';

export const s3 = new S3Client();
export const ses = new SESClient();

export const createS3ObjectKey = (prefix: string) => {
  const key = nanoid(24);
  return `${prefix}/${key[0]}/${key[0]}${key[1]}/${key}`;
};
