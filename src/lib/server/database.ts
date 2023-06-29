import { PrismaClient as DefaultPrismaClient } from '@prisma/client';
import { exists, transaction } from './prisma';

export const prismaClient = new DefaultPrismaClient()
  .$extends(exists)
  .$extends(transaction);

export type PrismaClient = typeof prismaClient;
