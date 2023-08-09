import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const S3 = new S3Client({});

export const s3GetObject = async (
  { bucketName }: { bucketName: string },
  key: string,
) => {
  return await S3.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
};

export const s3PutObject = async (
  { bucketName }: { bucketName: string },
  key: string,
  contentType: string,
  buffer: Buffer,
) => {
  await S3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
};

export const s3DeleteObject = async (
  { bucketName }: { bucketName: string },
  key: string,
) => {
  await S3.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
};
