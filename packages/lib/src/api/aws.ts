import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const DynamoDB = new DynamoDBClient({ region: 'ap-northeast-2' });
export const S3 = new S3Client({ region: 'ap-northeast-2' });

type DDBGetItemParams = { table: string; id: string };
export const ddbGetItem = async <T = unknown>({
  table,
  id,
}: DDBGetItemParams) => {
  const item = await DynamoDB.send(
    new GetItemCommand({
      TableName: table,
      Key: { id: { S: id } },
    }),
  );

  if (!item.Item?.data?.S) {
    throw new Error('Item not found');
  }

  return JSON.parse(item.Item.data.S) as T;
};

type DDBPutItemParams = {
  table: string;
  id: string;
  data: Record<string, unknown>;
};
export const ddbPutItem = async ({ table, id, data }: DDBPutItemParams) => {
  return await DynamoDB.send(
    new PutItemCommand({
      TableName: table,
      Item: {
        id: { S: id },
        data: { S: JSON.stringify(data) },
      },
    }),
  );
};

type S3GetObjectParams = { bucket: string; key: string };
export const s3GetObject = async ({ bucket, key }: S3GetObjectParams) => {
  return await S3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
};

type S3PutObjectParams = {
  bucket: string;
  key: string;
  buffer: Buffer;
  conetentType?: string;
  meta?: Record<string, unknown>;
};
export const s3PutObject = async ({
  bucket,
  key,
  buffer,
  conetentType,
  meta,
}: S3PutObjectParams) => {
  return await S3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: conetentType,
      Metadata: meta ? { meta: JSON.stringify(meta) } : undefined,
    }),
  );
};

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

type S3DeleteObjectParams = { bucket: string; key: string };
export const s3DeleteObject = async ({ bucket, key }: S3DeleteObjectParams) => {
  await S3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
};
