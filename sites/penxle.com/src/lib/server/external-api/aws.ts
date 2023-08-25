import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const S3 = new S3Client();

type S3PutObjectGetSignedUrlParams = {
  bucket: string;
  key: string;
  meta?: Record<string, unknown>;
};
export const s3PutObjectGetSignedUrl = async ({
  bucket,
  key,
  meta,
}: S3PutObjectGetSignedUrlParams) => {
  return await getSignedUrl(
    S3,
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Metadata: meta ? { meta: JSON.stringify(meta) } : undefined,
    }),
    { expiresIn: 60 * 60 }, // 1 hour
  );
};
