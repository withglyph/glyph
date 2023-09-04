import { S3Client } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';

export const s3 = new S3Client();

export const createS3ObjectKey = (prefix: string) => {
  const key = nanoid(24);
  return `${prefix}/${key[0]}/${key[0]}${key[1]}/${key}`;
};
