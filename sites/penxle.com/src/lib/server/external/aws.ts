import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';
import {
  PRIVATE_AWS_ACCESS_KEY_ID,
  PRIVATE_AWS_SECRET_ACCESS_KEY,
} from '$env/static/private';

const S3 = new S3Client({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: PRIVATE_AWS_ACCESS_KEY_ID,
    secretAccessKey: PRIVATE_AWS_SECRET_ACCESS_KEY,
  },
});

export const createS3ObjectKey = () => {
  const key = nanoid(24);
  return `${key[0]}/${key[0]}${key[1]}/${key}`;
};

export const s3PutObject = async (
  key: string,
  name: string,
  buffer: Buffer,
) => {
  return await S3.send(
    new PutObjectCommand({
      Bucket: 'penxle-uploads',
      Key: key,
      Body: buffer,
      Metadata: { Name: encodeURIComponent(name) },
    }),
  );
};

export const s3PutObjectGetSignedUrl = async (key: string, name: string) => {
  return await getSignedUrl(
    S3,
    new PutObjectCommand({
      Bucket: 'penxle-uploads',
      Key: key,
      Metadata: { Name: encodeURIComponent(name) },
    }),
    { expiresIn: 20 * 60 }, // 20 minutes
  );
};
