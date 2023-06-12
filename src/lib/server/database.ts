import { Prisma, PrismaClient } from '@prisma/client';

export const db = new PrismaClient().$extends({
  model: {
    $allModels: {
      async exists<T>(
        this: T,
        { where }: { where: Prisma.Args<T, 'findUnique'>['where'] }
      ): Promise<boolean> {
        const context = Prisma.getExtensionContext(this);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (context as any).findFirst({
          where,
          select: { id: true },
        });
        return result !== null;
      },
    },
  },
});
