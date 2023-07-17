import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';
import { AWS_S3_BUCKET } from '$env/static/private';

const S3 = new S3Client({});

export const createS3ObjectKey = () => {
  const key = nanoid(24);
  return `${key[0]}/${key[0]}${key[1]}/${key}`;
};

export const s3PutObjectGetSignedUrl = async (key: string, name: string) => {
  return await getSignedUrl(
    S3,
    new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: key,
      Metadata: { Name: encodeURIComponent(name) },
    }),
    { expiresIn: 20 * 60 } // 20 minutes
  );
};

export const s3DeleteObject = async (key: string) => {
  await S3.send(
    new DeleteObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: key,
    })
  );
};
