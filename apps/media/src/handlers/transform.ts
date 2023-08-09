import sharp from 'sharp';
import { ApiHandler } from 'sst/node/api';
import { Bucket } from 'sst/node/bucket';
import { error } from '../lib/response';
import { s3GetObject } from '../lib/s3';

export const handler = ApiHandler(async (event) => {
  if (!event.pathParameters || !event.queryStringParameters) {
    return error(400, 'invalid_request');
  }

  const key = event.pathParameters.key;
  if (!key) {
    return error(400, 'invalid_request');
  }

  const size = Number(event.queryStringParameters.s);
  const quality = Number(event.queryStringParameters.q ?? 80);

  if (!size || !quality) {
    return error(400, 'invalid_request');
  }

  let object;
  try {
    object = await s3GetObject(Bucket.Data, key);
  } catch {
    return error(400, 'object_not_found');
  }

  const buffer = Buffer.from(await object.Body!.transformToByteArray());

  const image = await sharp(buffer, { failOn: 'none' })
    .resize({
      width: size,
      height: size,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toBuffer();

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'image/webp' },
    body: image.toString('base64'),
    isBase64Encoded: true,
  };
});
