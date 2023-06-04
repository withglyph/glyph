import { db } from '$lib/server/database';
import {
  createS3ObjectKey,
  s3DeleteObject,
  s3PutObjectGetSignedUrl,
} from '$lib/server/external/aws';
import { processMedia } from '$lib/server/external/mp';
import { createId } from '$lib/utils';
import { builder } from '../builder';

/**
 * * Types
 */

builder.prismaObject('Image', {
  fields: (t) => ({
    id: t.exposeString('id'),

    path: t.exposeString('path'),
    sizes: t.exposeIntList('sizes'),

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

builder.queryFields((t) => ({
  images: t.prismaField({
    type: ['Image'],
    resolve: async (query) => {
      return await db.image.findMany({
        ...query,
        orderBy: { createdAt: 'desc' },
      });
    },
  }),

  authBackgroundImage: t.prismaField({
    type: 'Image',
    nullable: true,
    resolve: async (query) => {
      const count = await db.image.count();

      return await db.image.findFirst({
        ...query,
        skip: Math.floor(Math.random() * count),
        take: 1,
        orderBy: { createdAt: 'asc' },
      });
    },
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  prepareImageUpload: t.field({
    type: PrepareImageUploadPayload,
    authScopes: { loggedIn: true },
    resolve: async () => {
      const path = `u/${createS3ObjectKey()}`;

      return {
        path,
        presignedUrl: await s3PutObjectGetSignedUrl(path),
      };
    },
  }),

  finalizeImageUpload: t.prismaField({
    type: 'Image',
    authScopes: { loggedIn: true },
    args: { input: t.arg({ type: FinalizeImageUploadInput }) },
    resolve: async (query, _, { input }) => {
      const {
        path,
        size,
        sizes,
        format,
        width,
        height,
        placeholder,
        color,
        hash,
      } = await processMedia(input.path, [320, 640, 960, 1280]);
      await s3DeleteObject(input.path);

      return await db.image.create({
        ...query,
        data: {
          id: createId(),
          name: input.name,
          path,
          sizes,
          size,
          format,
          width,
          height,
          placeholder,
          color,
          hash,
        },
      });
    },
  }),
}));
