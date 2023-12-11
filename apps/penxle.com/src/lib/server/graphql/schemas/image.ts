import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as R from 'radash';
import { useCache } from '$lib/server/cache';
import { aws } from '$lib/server/external-api';
import { finalizeImage } from '$lib/server/utils';
import { createId } from '$lib/utils';
import { defineSchema } from '../builder';
import type { ImageBounds } from '$lib/utils';

export const imageSchema = defineSchema((builder) => {
  /**
   * * Types
   */

  builder.prismaObject('Image', {
    fields: (t) => ({
      id: t.exposeID('id'),
      width: t.exposeInt('width'),
      height: t.exposeInt('height'),
      placeholder: t.exposeString('placeholder'),

      url: t.field({
        type: 'String',
        resolve: (parent) => `https://pnxl.net/${parent.path}`,
      }),
    }),
  });

  const PrepareImageUploadResult = builder.simpleObject('PrepareImageUploadResult', {
    fields: (t) => ({
      key: t.string(),
      presignedUrl: t.string(),
    }),
  });

  /**
   * * Inputs
   */

  const FinalizeImageUploadInput = builder.inputType('FinalizeImageUploadInput', {
    fields: (t) => ({
      key: t.string(),
      name: t.string(),
      bounds: t.field({ type: 'JSON', required: false }),
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
        const id = await useCache(
          'authLayoutBackgroundImage',
          async () => {
            const post = await db.post.findUnique({
              include: { publishedRevision: { include: { freeContent: true } } },
              where: { id: 'authlayout_bg' },
            });

            if (!post?.publishedRevision) {
              return null;
            }

            const content = post.publishedRevision.freeContent.data;

            const ids = (content as { type: string; attrs: Record<string, unknown> }[])
              .filter(({ type }) => type === 'image')
              .map(({ attrs }) => attrs.id as string);

            return R.draw(ids);
          },
          10,
        );

        if (!id) {
          return null;
        }

        return await db.image.findUnique({
          ...query,
          where: { id },
        });
      },
    }),
  }));

  /**
   * * Mutations
   */

  builder.mutationFields((t) => ({
    prepareImageUpload: t.withAuth({ user: true }).field({
      type: PrepareImageUploadResult,
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

    finalizeImageUpload: t.withAuth({ user: true }).prismaField({
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
        const source = await object.Body!.transformToByteArray();
        const res = await finalizeImage(source, input.bounds as ImageBounds);

        const key = aws.createS3ObjectKey('images');
        const ext = input.name.split('.').pop() ?? 'unk';
        const path = `${key}.${ext}`;

        await aws.s3.send(
          new PutObjectCommand({
            Bucket: 'penxle-data',
            Key: path,
            Body: res.buffer,
            ContentType: object.ContentType ?? `image/${res.format}`,
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
            format: `image/${res.format}`,
            size: res.size,
            width: res.width,
            height: res.height,
            path,
            color: res.color,
            placeholder: res.placeholder,
            hash: res.hash,
          },
        });
      },
    }),
  }));
});
