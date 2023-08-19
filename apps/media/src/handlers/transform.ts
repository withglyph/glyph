import sharp from 'sharp';
import { error } from '../lib/response';
import { s3GetObject } from '../lib/s3';
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';

export const handler = (async (event) => {
  if (!event.queryStringParameters) {
    return error(400, 'invalid_request');
  }

  const key = event.rawPath.slice(1);
  if (!key) {
    return error(400, 'invalid_request');
  }

  const size = Math.min(Number(event.queryStringParameters.s), 8192);
  const quality = Math.min(Number(event.queryStringParameters.q ?? 75), 75);

  if (!size || !quality) {
    return error(400, 'invalid_request');
  }

  let object;
  try {
    object = await s3GetObject('penxle-data', key);
  } catch {
    return error(400, 'object_not_found');
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const buffer = Buffer.from(await object.Body!.transformToByteArray());

  const image = await sharp(buffer, { failOn: 'none' })
    .resize({
      width: size,
      height: size,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({
      quality,
      effort: 6,
    })
    .toBuffer();

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'image/webp' },
    body: image.toString('base64'),
    isBase64Encoded: true,
  };
}) satisfies APIGatewayProxyHandlerV2;
