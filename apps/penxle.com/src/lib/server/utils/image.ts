import { PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { rgbaToThumbHash } from 'thumbhash';
import { aws } from '$lib/server/external-api';
import { createId } from '$lib/utils';
import { getDominantColor } from './mmcq';
import type { ImageBounds } from '$lib/utils';
import type { InteractiveTransactionClient } from '../database';

type ImageSource = Buffer | ArrayBuffer | Uint8Array;

export const finalizeImage = async (source: ImageSource, bounds?: ImageBounds) => {
  let image = sharp(source, { failOn: 'none' }).rotate().flatten({ background: '#ffffff' });

  if (bounds) {
    image = image.extract(bounds);
  }

  const getOutput = async () => {
    return await image.clone().toBuffer({ resolveWithObject: true });
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

  const [output, color, placeholder, hash] = await Promise.all([getOutput(), getColor(), getPlaceholder(), getHash()]);

  return {
    buffer: output.data,
    format: output.info.format,
    size: output.info.size,
    width: output.info.width,
    height: output.info.height,
    color,
    placeholder,
    hash,
  };
};

type DirectUploadImageParams = {
  db: InteractiveTransactionClient;
  userId?: string;
  name: string;
  source: ImageSource;
  bounds?: ImageBounds;
};
export const directUploadImage = async ({ db, userId, name, source, bounds }: DirectUploadImageParams) => {
  const res = await finalizeImage(source, bounds);

  const key = aws.createS3ObjectKey('images');
  const ext = res.format;
  const path = `${key}.${ext}`;

  await aws.s3.send(
    new PutObjectCommand({
      Bucket: 'penxle-data',
      Key: path,
      Body: res.buffer,
      ContentType: `image/${res.format}`,
    }),
  );

  const image = await db.image.create({
    select: { id: true },
    data: {
      id: createId(),
      userId,
      name,
      format: res.format,
      size: res.size,
      width: res.width,
      height: res.height,
      path,
      color: res.color,
      placeholder: res.placeholder,
      hash: res.hash,
    },
  });

  return image.id;
};
