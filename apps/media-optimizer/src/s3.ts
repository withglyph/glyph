import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const S3 = new S3Client({});

export const s3GetObject = async (key: string) => {
  return await S3.send(
    new GetObjectCommand({
      Bucket: 'penxle-uploads',
      Key: key,
    }),
  );
};

export const s3PutObject = async (
  key: string,
  contentType: string,
  buffer: Buffer,
) => {
  await S3.send(
    new PutObjectCommand({
      Bucket: 'penxle-data',
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
};

export const s3DeleteObject = async (key: string) => {
  await S3.send(
    new DeleteObjectCommand({
      Bucket: 'penxle-uploads',
      Key: key,
    }),
  );
};
