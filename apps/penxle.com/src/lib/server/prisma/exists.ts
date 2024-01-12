import { Prisma } from '$prisma';

export const exists = Prisma.defineExtension({
  name: 'exists',
  model: {
    $allModels: {
      async exists<T>(this: T, { where }: Pick<Prisma.Args<T, 'findFirst'>, 'where'>): Promise<boolean> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const context = Prisma.getExtensionContext(this) as any;
        const result = await context.findFirst({ where });
        return result !== null;
      },

      async existsUnique<T>(this: T, { where }: Pick<Prisma.Args<T, 'findUnique'>, 'where'>): Promise<boolean> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const context = Prisma.getExtensionContext(this) as any;
        const result = await context.findUnique({ where });
        return result !== null;
      },
    },
  },
});
