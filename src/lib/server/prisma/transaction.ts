import { Prisma } from '@prisma/client';
import type { PrismaClient } from '../database';

type BareTransactionClient = Parameters<
  Parameters<PrismaClient['$transaction']>[0]
>[0];
export type TransactionClient = Omit<BareTransactionClient, '$begin'> & {
  $commit: () => Promise<void>;
  $rollback: () => Promise<void>;
};

export const transaction = Prisma.defineExtension({
  name: 'transaction',
  client: {
    async $begin() {
      let set: (client: BareTransactionClient) => void;
      let commit: () => void;
      let rollback: () => void;

      const txPromise = new Promise<void>((resolve, reject) => {
        commit = resolve;
        rollback = reject;
      });

      const clientPromise = new Promise<BareTransactionClient>((resolve) => {
        set = resolve;
      });

      (Prisma.getExtensionContext(this) as PrismaClient)
        .$transaction(async ($tx) => {
          set($tx);
          await txPromise;
        })
        .catch(() => {
          // noop
        });

      const client = await clientPromise;

      return new Proxy(client, {
        get(target, prop) {
          if (prop === '$commit') {
            return commit;
          }

          if (prop === '$rollback') {
            return rollback;
          }

          return target[prop as keyof BareTransactionClient];
        },
      }) as unknown as TransactionClient;
    },
  },
});
