import { Prisma } from '@prisma/client';

export const exists = Prisma.defineExtension({
  name: 'exists',
  model: {
    $allModels: {
      async exists<T>(this: T, { where }: Pick<Prisma.Args<T, 'findFirst'>, 'where'>): Promise<boolean> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const context = Prisma.getExtensionContext(this) as any;
        const result = await context.findFirst({ where, select: { id: true } });
        return result !== null;
      },
    },
  },
});
