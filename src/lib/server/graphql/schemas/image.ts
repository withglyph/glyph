import lqip from 'lqip-modern';
import sharp from 'sharp';
import { db } from '$lib/server/database';
import {
  createS3ObjectKey,
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
    placeholder: t.exposeString('placeholder'),
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
      const path = `uploads/${createS3ObjectKey()}`;

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

      const loadImage = () => sharp(data, { failOn: 'none' }).rotate();

      const metadata = await loadImage().metadata();
      const key = `${createS3ObjectKey()}.webp`;

      const resize = async (width: number) => {
        const buffer = await loadImage()
          .resize(width, width, { fit: 'inside' })
          .webp({ quality: 75, effort: 6 })
          .toBuffer();
        await s3PutObject(`${width}w/${key}`, 'image/webp', buffer);
      };

      const orig = async () => {
        const buffer = await loadImage()
          .webp({ lossless: true, effort: 6 })
          .toBuffer();
        await s3PutObject(`blob/${key}`, 'image/webp', buffer);
      };

      await Promise.all([
        resize(320),
        resize(480),
        resize(640),
        resize(720),
        orig(),
      ]);

      const {
        metadata: { dataURIBase64 },
      } = await lqip(Buffer.from(data), {
        resize: 16,
        outputOptions: { quality: 75, effort: 6 },
      });

      return await db.image.create({
        ...query,
        data: {
          id: createId(),
          profileId: context.session.profileId,
          name: input.name,
          size: metadata.size!,
          format: metadata.format!,
          width: metadata.width!,
          height: metadata.height!,
          path: key,
          placeholder: dataURIBase64,
          color: '',
        },
      });
    },
  }),
}));
