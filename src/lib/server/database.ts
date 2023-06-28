import { PrismaClient as DefaultPrismaClient } from '@prisma/client';
import { exists } from './prisma/exists';
import { transaction } from './prisma/transaction';

export const prismaClient = new DefaultPrismaClient()
  .$extends(exists)
  .$extends(transaction);

export type PrismaClient = typeof prismaClient;
