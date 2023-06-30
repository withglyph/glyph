import {
  createS3ObjectKey,
  s3DeleteObject,
  s3PutObjectGetSignedUrl,
} from '$lib/server/external/aws';
import { processMedia } from '$lib/server/external/mp';
import { builder } from '../builder';

/**
 * * Types
 */

builder.prismaObject('Image', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeInt('id'),

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

const PrepareImageUploadInput = builder.inputType('PrepareImageUploadInput', {
  fields: (t) => ({
    name: t.string(),
  }),
});

const FinalizeImageUploadInput = builder.inputType('FinalizeImageUploadInput', {
  fields: (t) => ({
    path: t.string(),
  }),
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  images: t.prismaField({
    type: ['Image'],
    resolve: async (query, _, __, { db }) => {
      return await db.image.findMany({
        ...query,
        orderBy: { id: 'desc' },
      });
    },
  }),

  featuredImage: t.prismaField({
    type: 'Image',
    nullable: true,
    resolve: async (query, _, __, { db }) => {
      const count = await db.image.count();

      return await db.image.findFirst({
        ...query,
        skip: Math.floor(Math.random() * count),
        take: 1,
        orderBy: { id: 'asc' },
      });
    },
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  prepareImageUpload: t.withAuth({ loggedIn: true }).field({
    type: PrepareImageUploadPayload,
    args: { input: t.arg({ type: PrepareImageUploadInput }) },
    resolve: async (_, { input }) => {
      const path = `u/${createS3ObjectKey()}/${input.name}`;

      return {
        path,
        presignedUrl: await s3PutObjectGetSignedUrl(path),
      };
    },
  }),

  finalizeImageUpload: t.withAuth({ loggedIn: true }).prismaField({
    type: 'Image',
    args: { input: t.arg({ type: FinalizeImageUploadInput }) },
    resolve: async (query, _, { input }, { db }) => {
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
      const name = input.path.split('/').pop()!;

      return await db.image.create({
        ...query,
        data: {
          name,
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
