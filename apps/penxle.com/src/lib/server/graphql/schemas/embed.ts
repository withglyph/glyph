import { iframely } from '$lib/server/external-api';
import { createId } from '$lib/utils';
import { defineSchema } from '../builder';

export const embedSchema = defineSchema((builder) => {
  /**
   * * Types
   */

  builder.prismaObject('Embed', {
    fields: (t) => ({
      id: t.exposeID('id'),
      type: t.exposeString('type'),
      url: t.exposeString('url'),
      title: t.exposeString('title', { nullable: true }),
      description: t.exposeString('description', { nullable: true }),
      thumbnailUrl: t.exposeString('thumbnailUrl', { nullable: true }),
      html: t.exposeString('html', { nullable: true }),
    }),
  });

  /**
   * * Inputs
   */

  const UnfurlEmbedInput = builder.inputType('UnfurlEmbedInput', {
    fields: (t) => ({
      url: t.string(),
    }),
  });

  /**
   * * Queries
   */

  // builder.queryFields((t) => ({
  // }));

  /**
   * * Mutations
   */

  builder.mutationFields((t) => ({
    unfurlEmbed: t.withAuth({ user: true }).prismaField({
      type: 'Embed',
      nullable: true,
      args: { input: t.arg({ type: UnfurlEmbedInput }) },
      resolve: async (query, _, { input }, { db }) => {
        const embed = await db.embed.findUnique({
          ...query,
          where: { url: input.url },
        });

        if (embed) {
          return embed;
        }

        try {
          const meta = await iframely.unfurl(input.url);

          return await db.embed.create({
            ...query,
            data: {
              id: createId(),
              type: meta.type,
              url: input.url,
              title: meta.title,
              description: meta.description,
              thumbnailUrl: meta.thumbnailUrl,
              html: meta.html,
            },
          });
        } catch {
          return null;
        }
      },
    }),
  }));
});
