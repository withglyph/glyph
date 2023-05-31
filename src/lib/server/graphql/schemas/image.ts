import { db } from '$lib/server/database';
import {
  createS3ObjectKey,
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

    width: t.exposeInt('width'),
    height: t.exposeInt('height'),

    color: t.exposeString('color'),
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
      const path = `u/${createS3ObjectKey()}`;

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
      const sizes = [320, 640, 960, 1280];

      const { path, size, format, width, height, placeholder, color, hash } =
        await processMedia(input.path, sizes);

      return await db.image.create({
        ...query,
        data: {
          id: createId(),
          profileId: context.session.profileId,
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
