import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const S3 = new S3Client({});

export const s3GetObject = async (bucket: string, key: string) => {
  return await S3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
};

export const s3PutObject = async (
  bucket: string,
  key: string,
  contentType: string,
  buffer: Buffer,
) => {
  await S3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
};

export const s3DeleteObject = async (bucket: string, key: string) => {
  await S3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
};
