import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';

const S3 = new S3Client({ region: 'ap-northeast-2' });

export const createS3ObjectKey = () => {
  const key = nanoid(24);
  return `${key[0]}/${key[0]}${key[1]}/${key}`;
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
