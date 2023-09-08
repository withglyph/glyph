import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { random } from 'radash';
import { aws } from '$lib/server/external-api';
import { getImageMetadata } from '$lib/server/utils/image';
import { createId } from '$lib/utils';
import { builder } from '../builder';

/**
 * * Types
 */

export const Image = builder.prismaObject('Image', {
  select: { id: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    path: t.exposeString('path'),
    color: t.exposeString('color'),
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
  },
);

/**
 * * Inputs
 */

const FinalizeImageUploadInput = builder.inputType('FinalizeImageUploadInput', {
  fields: (t) => ({
    key: t.string(),
    name: t.string(),
  }),
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  authLayoutBackgroundImage: t.prismaField({
    type: 'Image',
    nullable: true,
    resolve: async (query, _, __, { db }) => {
      const count = await db.image.count();

      return await db.image.findFirst({
        ...query,
        skip: random(0, count - 1),
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
    resolve: async () => {
      const key = aws.createS3ObjectKey('images');

      const presignedUrl = await getSignedUrl(
        aws.s3,
        new PutObjectCommand({
          Bucket: 'penxle-uploads',
          Key: key,
        }),
        { expiresIn: 60 * 60 }, // 1 hour
      );

      return {
        key,
        presignedUrl,
      };
    },
  }),

  finalizeImageUpload: t.withAuth({ auth: true }).prismaField({
    type: 'Image',
    args: { input: t.arg({ type: FinalizeImageUploadInput }) },
    resolve: async (query, _, { input }, { db, ...context }) => {
      const object = await aws.s3.send(
        new GetObjectCommand({
          Bucket: 'penxle-uploads',
          Key: input.key,
        }),
      );

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const buffer = Buffer.from(await object.Body!.transformToByteArray());
      const metadata = await getImageMetadata(buffer);

      const key = aws.createS3ObjectKey('images');
      const ext = input.name.split('.').pop() ?? 'unknown';
      const path = `${key}.${ext}`;

      await aws.s3.send(
        new PutObjectCommand({
          Bucket: 'penxle-data',
          Key: path,
          Body: buffer,
        }),
      );

      await aws.s3.send(
        new DeleteObjectCommand({
          Bucket: 'penxle-uploads',
          Key: input.key,
        }),
      );

      return await db.image.create({
        ...query,
        data: {
          id: createId(),
          userId: context.session.userId,
          name: input.name,
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
    },
  }),
}));
