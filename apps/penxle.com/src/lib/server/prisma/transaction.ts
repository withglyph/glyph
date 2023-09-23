import { Prisma } from '@prisma/client';
import type { PrismaClient } from '../database';

type BareTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$begin' | '$use' | '$extends'
>;

export type TransactionClient = BareTransactionClient & {
  $commit: () => Promise<void>;
  $rollback: () => Promise<void>;
};
export type InteractiveTransactionClient = Omit<TransactionClient, '$commit' | '$rollback'>;

type BeginOptions = {
  isolation?: Prisma.TransactionIsolationLevel;
};

export const transaction = Prisma.defineExtension({
  name: 'transaction',
  client: {
    async $begin(options?: BeginOptions) {
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

      (Prisma.getExtensionContext(this) as unknown as PrismaClient)
        .$transaction(
          async ($tx) => {
            set($tx);
            await txPromise;
          },
          {
            isolationLevel: options?.isolation,
            maxWait: 10 * 1000,
            timeout: 60 * 1000,
          },
        )
        .catch(() => {
          // noop
        });

      const client = await clientPromise;

      return new Proxy(client, {
        get(target, prop) {
          switch (prop) {
            case '$commit': {
              return commit;
            }
            case '$rollback': {
              return rollback;
            }
            default: {
              return target[prop as keyof BareTransactionClient];
            }
          }
        },
      }) as TransactionClient;
    },
  },
});
