import { Prisma } from '@prisma/client';
import stringHash from '@sindresorhus/string-hash';
import type { PrismaClient } from '../database';

type BareTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$begin' | '$use' | '$extends'
>;

export type TransactionClient = BareTransactionClient & {
  $commit: () => Promise<void>;
  $rollback: () => Promise<void>;
  $lock: (key: string) => Promise<void>;
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
            case '$lock': {
              return async (key: string) => {
                const k = stringHash(key);
                // spell-checker:disable-next-line
                await target.$executeRaw`SELECT pg_advisory_xact_lock(${k})`;
              };
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
