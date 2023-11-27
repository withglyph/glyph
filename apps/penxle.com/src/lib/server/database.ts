import { PrismaClient as BasePrismaClient } from '@prisma/client';
import { building, dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { exists, logging, transaction } from './prisma';

const baseClient = new BasePrismaClient({
  log: dev ? [{ level: 'query', emit: 'event' }] : [],
  datasources: { db: { url: env.PRIVATE_DATABASE_URL } },
});

baseClient.$on('query', logging);

export const prismaClient = baseClient.$extends(exists).$extends(transaction);

export type PrismaClient = typeof prismaClient;
export type { InteractiveTransactionClient, TransactionClient } from './prisma';

if (!dev && !building) {
  // warm up the database connection
  await prismaClient.$connect();
}
