import { PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { rgbaToThumbHash } from 'thumbhash';
import { aws } from '$lib/server/external-api';
import { createId } from '$lib/utils';
import { getDominantColor } from './mmcq';
import type { InteractiveTransactionClient } from '../database';

export const getImageMetadata = async (buffer: Buffer) => {
  const image = sharp(buffer, { failOn: 'none' })
    .rotate()
    .flatten({ background: '#ffffff' });

  const metadata = await image.metadata();

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

  const [color, placeholder, hash] = await Promise.all([
    getColor(),
    getPlaceholder(),
    getHash(),
  ]);

  return {
    format: metadata.format ?? 'unknown',
    size: metadata.size ?? 0,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    color,
    placeholder,
    hash,
  };
};

type DirectUploadImageParams = {
  db: InteractiveTransactionClient;
  userId?: string;
  name: string;
  buffer: Buffer;
};
export const directUploadImage = async ({
  db,
  userId,
  name,
  buffer,
}: DirectUploadImageParams) => {
  const key = aws.createS3ObjectKey('images');
  const ext = name.split('.').pop() ?? 'unknown';
  const path = `${key}.${ext}`;

  const metadata = await getImageMetadata(buffer);

  await aws.s3.send(
    new PutObjectCommand({
      Bucket: 'penxle-data',
      Key: path,
      Body: buffer,
    }),
  );

  const image = await db.image.create({
    select: { id: true },
    data: {
      id: createId(),
      userId,
      name,
      format: metadata.format,
      size: metadata.size,
      width: metadata.width,
      height: metadata.height,
      path,
      color: metadata.color,
      placeholder: metadata.placeholder,
      hash: metadata.hash,
    },
  });

  return image.id;
};
