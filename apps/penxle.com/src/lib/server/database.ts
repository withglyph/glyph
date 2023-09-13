import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { provider } from '@penxle/lambda/metrics';
import { PrismaClient as BasePrismaClient } from '@prisma/client';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { dev } from '$app/environment';
import { PRIVATE_DATABASE_URL } from '$env/static/private';
import { exists, logging, transaction } from './prisma';

const baseClient = new BasePrismaClient({
  log: dev ? [{ level: 'query', emit: 'event' }] : [],
  datasources: { db: { url: PRIVATE_DATABASE_URL } },
});

baseClient.$on('query', logging);

registerInstrumentations({
  tracerProvider: provider,
  instrumentations: [new PrismaInstrumentation()],
});

export const prismaClient = baseClient.$extends(exists).$extends(transaction);

export type PrismaClient = typeof prismaClient;
export type { InteractiveTransactionClient, TransactionClient } from './prisma';
