import sharp from 'sharp';
import { ApiHandler } from 'sst/node/api';
import { Bucket } from 'sst/node/bucket';
import { getDominantColor } from '../lib/mmcq';
import { error } from '../lib/response';
import { s3DeleteObject, s3GetObject, s3PutObject } from '../lib/s3';

export const handler = ApiHandler(async (event) => {
  if (!event.body) {
    return error(400, 'invalid_request');
  }

  const data = JSON.parse(event.body);
  if (!data.key) {
    return error(400, 'invalid_request');
  }

  let object;
  try {
    object = await s3GetObject(Bucket.Uploads, data.key);
  } catch {
    return error(400, 'object_not_found');
  }

  await s3DeleteObject(Bucket.Uploads, data.key);

  const name = decodeURIComponent(object.Metadata!.name);
  const buffer = Buffer.from(await object.Body!.transformToByteArray());

  const image = sharp(buffer, { failOn: 'none' })
    .rotate()
    .flatten({ background: '#ffffff' });

  const metadata = await image.metadata();

  const getOutput = async () => {
    return await image
      .clone()
      .webp({ quality: 80, effort: 6 })
      .toBuffer({ resolveWithObject: true });
  };

  const getColor = async () => {
    const buffer = await image.clone().raw().toBuffer();
    return getDominantColor(buffer);
  };

  const getHash = async () => {
    const size = 16;

    const raw = await image
      .clone()
      .greyscale()
      .resize(size + 1, size, { fit: 'fill' })
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

  const [output, color, hash] = await Promise.all([
    getOutput(),
    getColor(),
    getHash(),
  ]);

  const path = `images/${data.key}.webp`;
  await s3PutObject(Bucket.Data, path, 'image/webp', output.data);

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
      hash,
    }),
  };
});
