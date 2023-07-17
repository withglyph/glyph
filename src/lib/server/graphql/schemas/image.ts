import {
  createS3ObjectKey,
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
    placeholder: t.exposeString('placeholder'),
  }),
});

const PrepareImageUploadPayload = builder.simpleObject(
  'PrepareImageUploadPayload',
  {
    fields: (t) => ({
      key: t.string(),
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
    key: t.string(),
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
  prepareImageUpload: t.withAuth({ auth: true }).field({
    type: PrepareImageUploadPayload,
    args: { input: t.arg({ type: PrepareImageUploadInput }) },
    resolve: async (_, { input }) => {
      const key = createS3ObjectKey();

      return {
        key,
        presignedUrl: await s3PutObjectGetSignedUrl(key, input.name),
      };
    },
  }),

  finalizeImageUpload: t.withAuth({ auth: true }).prismaField({
    type: 'Image',
    args: { input: t.arg({ type: FinalizeImageUploadInput }) },
    resolve: async (query, _, { input }, { db }) => {
      const {
        name,
        format,
        fileSize,
        blobSize,
        width,
        height,
        path,
        hash,
        placeholder,
      } = await processMedia(input.key);

      return await db.image.create({
        ...query,
        data: {
          name,
          format,
          fileSize,
          blobSize,
          width,
          height,
          path,
          hash,
          placeholder,
        },
      });
    },
  }),
}));
