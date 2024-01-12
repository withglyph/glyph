import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

let P;
try {
  P = require('../.prisma');
} catch {
  P = require('../../../../.prisma');
}

const { Prisma, PrismaClient, $Enums: PrismaEnums } = P;

export { Prisma, PrismaClient, PrismaEnums };
