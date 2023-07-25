import { s3DeleteObject, s3GetObject, s3PutObject } from './s3';
import { optimize } from './sharp';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  const key = event.pathParameters?.path;
  if (!key) {
    return { statusCode: 400, body: 'Bad Request' };
  }

  const object = await s3GetObject(key);
  await s3DeleteObject(key);

  const name = decodeURIComponent(object.Metadata!.name);
  const body = Buffer.from(await object.Body!.transformToByteArray());

  const res = await optimize(body);

  const path = `images/${key}.webp`;
  await s3PutObject(path, 'image/webp', res.buffer);

  return {
    statusCode: 200,
    body: JSON.stringify({ ...res.metadata, name, path }),
  };
};
