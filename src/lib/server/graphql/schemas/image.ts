import { db, injectLoader } from '$lib/server/database';
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

export const Image = builder.loadableObject('Image', {
  ...injectLoader('images'),
  fields: (t) => ({
    id: t.exposeString('id'),

    path: t.exposeString('path'),
    sizes: t.intList({ resolve: ({ sizes }) => sizes as number[] }),

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
  images: t.field({
    type: [Image],
    resolve: async () => {
      return await db
        .selectFrom('images')
        .selectAll()
        .orderBy('createdAt', 'desc')
        .execute();
    },
  }),

  authBackgroundImage: t.field({
    type: Image,
    nullable: true,
    resolve: async () => {
      const { count } = await db
        .selectFrom('images')
        .select(db.fn.count<number>('id').as('count'))
        .executeTakeFirstOrThrow();

      return await db
        .selectFrom('images')
        .selectAll()
        .offset(Math.floor(Math.random() * count))
        .limit(1)
        .executeTakeFirst();
    },
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  prepareImageUpload: t.field({
    type: PrepareImageUploadPayload,
    args: { input: t.arg({ type: PrepareImageUploadInput }) },
    authScopes: { loggedIn: true },
    resolve: async (_, { input }) => {
      const path = `u/${createS3ObjectKey()}/${input.name}`;

      return {
        path,
        presignedUrl: await s3PutObjectGetSignedUrl(path),
      };
    },
  }),

  finalizeImageUpload: t.authField({
    type: Image,
    authScopes: { loggedIn: true },
    args: { input: t.arg({ type: FinalizeImageUploadInput }) },
    resolve: async (_, { input }) => {
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

      const id = createId();
      await db
        .insertInto('images')
        .values({
          id,
          name,
          path,
          sizes: JSON.stringify(sizes),
          size,
          format,
          width,
          height,
          placeholder,
          color,
          hash,
          createdAt: new Date(),
        })
        .executeTakeFirstOrThrow();

      return id;
    },
  }),
}));
