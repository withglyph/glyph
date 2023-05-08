import argon2 from 'argon2';
import { z } from 'zod';
import { t } from '../trpc';

export const passwordRouter = t.router({
  hashPassword: t.procedure.input(z.string()).mutation(async ({ input }) => {
    return await argon2.hash(input);
  }),

  verifyPassword: t.procedure
    .input(z.object({ hash: z.string(), password: z.string() }))
    .mutation(async ({ input }) => {
      return await argon2.verify(input.hash, input.password);
    }),
});
