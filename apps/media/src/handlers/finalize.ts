import sharp from 'sharp';
import { rgbaToThumbHash } from 'thumbhash';
import { getDominantColor } from '../lib/mmcq';
import { error } from '../lib/response';
import { s3DeleteObject, s3GetObject, s3PutObject } from '../lib/s3';
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';

export const handler = (async (event) => {
  if (!event.body) {
    return error(400, 'invalid_request');
  }

  const data = JSON.parse(event.body) as { key: string };
  if (!data.key) {
    return error(400, 'invalid_request');
  }

  let object;
  try {
    object = await s3GetObject('penxle-uploads', data.key);
  } catch {
    return error(400, 'object_not_found');
  }

  await s3DeleteObject('penxle-uploads', data.key);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const name = decodeURIComponent(object.Metadata!.name);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const buffer = Buffer.from(await object.Body!.transformToByteArray());

  const image = sharp(buffer, { failOn: 'none' })
    .rotate()
    .flatten({ background: '#ffffff' });

  const metadata = await image.metadata();

  const getOutput = async () => {
    return await image
      .clone()
      .webp({ quality: 75, effort: 6 })
      .toBuffer({ resolveWithObject: true });
  };

  const getColor = async () => {
    const buffer = await image.clone().raw().toBuffer();
    return getDominantColor(buffer);
  };

  const getPlaceholder = async () => {
    const {
      data: raw,
      info: { width, height },
    } = await image
      .clone()
      .resize({
        width: 100,
        height: 100,
        fit: 'inside',
      })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const hash = rgbaToThumbHash(width, height, raw);
    return Buffer.from(hash).toString('base64');
  };

  const getHash = async () => {
    const size = 16;

    const raw = await image
      .clone()
      .greyscale()
      .resize({
        width: size + 1,
        height: size,
        fit: 'fill',
      })
      .raw()
      .toBuffer();

    let difference = '';
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const left = raw[row * (size + 1) + col];
        const right = raw[row * (size + 1) + col + 1];
        difference += left < right ? 1 : 0;
      }
    }

    let hash = '';
    for (let i = 0; i < difference.length; i += 4) {
      const chunk = difference.slice(i, i + 4);
      hash += Number.parseInt(chunk, 2).toString(16);
    }

    return hash;
  };

  const [output, color, placeholder, hash] = await Promise.all([
    getOutput(),
    getColor(),
    getPlaceholder(),
    getHash(),
  ]);

  const path = `images/${data.key}.webp`;
  await s3PutObject('penxle-data', path, 'image/webp', output.data);

  return {
    statusCode: 200,
    body: JSON.stringify({
      name,
      path,
      format: metadata.format,
      fileSize: metadata.size,
      blobSize: output.info.size,
      width: output.info.width,
      height: output.info.height,
      color,
      placeholder,
      hash,
    }),
  };
}) satisfies APIGatewayProxyHandlerV2;
