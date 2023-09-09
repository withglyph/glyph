import { range } from 'radash';
import { sendEmail } from '$lib/server/email';
import { Test } from '$lib/server/email/templates';
import { createRandomAvatar } from '$lib/server/utils';
import { builder } from '../builder';

/**
 * * Queries
 */

builder.queryFields((t) => ({
  randomAvatars: t.stringList({
    resolve: () => {
      return [...range(1, 16)].map(() => createRandomAvatar());
    },
  }),

  hello: t.prismaField({
    type: 'User',
    args: { email: t.arg.string() },
    resolve: (query, _, { email }, { db }) => {
      return db.user.findFirstOrThrow({
        ...query,
        where: {
          email,
        },
      });
    },
  }),

  email: t.string({
    resolve: async () => {
      await sendEmail({
        subject: '안녕하세요!',
        recipient: 'finn@penxle.io',
        template: Test,
        props: { name: 'Finn' },
      });

      return '';
    },
  }),
}));
