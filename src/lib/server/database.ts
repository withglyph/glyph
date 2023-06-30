import { PrismaClient as DefaultPrismaClient } from '@prisma/client';
import { dev } from '$app/environment';
import { exists, logging, transaction } from './prisma';

const defaultClient = new DefaultPrismaClient({
  log: dev ? [{ level: 'query', emit: 'event' }] : [],
});

defaultClient.$on('query', logging);

export const prismaClient = defaultClient
  .$extends(exists)
  .$extends(transaction);

export type PrismaClient = typeof prismaClient;
export type { TransactionClient } from './prisma';
