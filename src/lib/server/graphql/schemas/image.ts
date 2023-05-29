import { decode, encode } from 'blurhash';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import { db } from '$lib/server/database';
import {
  createS3UploadPath,
  s3DeleteObject,
  s3GetObject,
  s3PutObject,
  s3PutObjectGetSignedUrl,
} from '$lib/server/external/aws';
import { createId } from '$lib/utils';
import { builder } from '../builder';

/**
 * * Types
 */

builder.prismaObject('Image', {
  fields: (t) => ({
    id: t.exposeString('id'),
    path: t.exposeString('path'),
  }),
});

const PrepareImageUploadPayload = builder.simpleObject(
  'PrepareImageUploadPayload',
  {
    fields: (t) => ({
      path: t.string(),
      presignedUrl: t.string(),
    }),
  }
);

/**
 * * Inputs
 */

const FinalizeImageUploadInput = builder.inputType('FinalizeImageUploadInput', {
  fields: (t) => ({
    name: t.string(),
    path: t.string(),
  }),
});

/**
 * * Queries
 */

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  prepareImageUpload: t.withAuth({ loggedIn: true }).field({
    type: PrepareImageUploadPayload,
    authScopes: { loggedIn: true },
    resolve: async () => {
      const path = createS3UploadPath('uploads', nanoid(), '');

      return {
        path,
        presignedUrl: await s3PutObjectGetSignedUrl(path),
      };
    },
  }),

  finalizeImageUpload: t.withAuth({ loggedIn: true }).prismaField({
    type: 'Image',
    authScopes: { loggedIn: true },
    args: { input: t.arg({ type: FinalizeImageUploadInput }) },
    resolve: async (query, _, { input }, context) => {
      const data = await s3GetObject(input.path);
      await s3DeleteObject(input.path);

      const image = sharp(data, { failOn: 'none' }).rotate();
      const webp = await image
        .webp({ quality: 100, effort: 6 })
        .toBuffer({ resolveWithObject: true });

      const path = createS3UploadPath('w-full', nanoid(), '.webp');
      await s3PutObject(path, 'image/webp', webp.data);

      const raw = await image
        .resize(32, 32, { fit: 'inside' })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const hash = encode(
        new Uint8ClampedArray(raw.data),
        raw.info.width,
        raw.info.height,
        4,
        4
      );

      const pixels = Buffer.from(decode(hash, raw.info.width, raw.info.height));
      const buffer = await sharp(pixels, {
        raw: { width: raw.info.width, height: raw.info.height, channels: 4 },
      })
        .webp({ quality: 100, effort: 6 })
        .toBuffer();

      const placeholder = `data:image/webp;base64,${buffer.toString('base64')}`;

      return await db.image.create({
        ...query,
        data: {
          id: createId(),
          profileId: context.session.profileId,
          name: input.name,
          size: webp.info.size,
          format: webp.info.format,
          width: webp.info.width,
          height: webp.info.height,
          path,
          placeholder,
        },
      });
    },
  }),
}));
