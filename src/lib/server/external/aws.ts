import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';
import { AWS_S3_BUCKET } from '$env/static/private';

const S3 = new S3Client({});

export const createS3ObjectKey = () => {
  const key = nanoid();
  return `${key[0]}/${key[0]}${key[1]}/${key}`;
};

export const s3GetObject = async (path: string) => {
  const resp = await S3.send(
    new GetObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: path,
    })
  );

  return await resp.Body!.transformToByteArray();
};

export const s3PutObject = async (
  path: string,
  contentType: string,
  buffer: Buffer
) => {
  await S3.send(
    new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: path,
      Body: buffer,
      ContentType: contentType,
    })
  );
};

export const s3PutObjectGetSignedUrl = async (path: string) => {
  return await getSignedUrl(
    S3,
    new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: path,
    }),
    { expiresIn: 60 * 60 }
  );
};

export const s3DeleteObject = async (path: string) => {
  await S3.send(
    new DeleteObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: path,
    })
  );
};
