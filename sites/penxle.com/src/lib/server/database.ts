import { PrismaClient as BasePrismaClient } from '@prisma/client';
import { dev } from '$app/environment';
import { exists, logging, transaction } from './prisma';

const baseClient = new BasePrismaClient({
  log: dev ? [{ level: 'query', emit: 'event' }] : [],
});

baseClient.$on('query', logging);

export const prismaClient = baseClient.$extends(exists).$extends(transaction);

export type PrismaClient = typeof prismaClient;
export type { InteractiveTransactionClient, TransactionClient } from './prisma';
