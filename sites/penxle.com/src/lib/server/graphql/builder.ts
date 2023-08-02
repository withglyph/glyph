import SchemaBuilder from '@pothos/core';
import PrismaPlugin from '@pothos/plugin-prisma';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects';
import ValidationPlugin from '@pothos/plugin-validation';
import { Prisma } from '@prisma/client';
import { GraphQLBigInt, GraphQLDateTime, GraphQLJSON } from 'graphql-scalars';
import { dev } from '$app/environment';
import { PermissionDeniedError } from '$lib/errors';
import type { AuthContext, Context } from './context';
import type PrismaTypes from '@pothos/plugin-prisma/generated';
import type { PrismaClient } from '@prisma/client';

if (dev) {
  // 개발환경에서만 강제로 순환 참조 걸어서 schema/**/* 리로드할 때 HMR이 builder까지 리로드하도록 함
  import('./schemas');
}

export const builder = new SchemaBuilder<{
  AuthContexts: {
    auth: Context & AuthContext;
  };
  AuthScopes: {
    auth: boolean;
    staff: boolean;
    user: { id: string };
  };
  Context: Context;
  DefaultInputFieldRequiredness: true;
  PrismaTypes: PrismaTypes;
  Scalars: {
    BigInt: { Input: bigint; Output: bigint };
    DateTime: { Input: Date; Output: Date };
    ID: { Input: string; Output: string };
    JSON: { Input: unknown; Output: unknown };
  };
}>({
  authScopes: (context) => ({
    auth: !!context.session,
    staff: false,
    user: ({ id }) => context.session?.userId === id,
  }),
  defaultInputFieldRequiredness: true,
  plugins: [
    PrismaPlugin,
    ScopeAuthPlugin,
    SimpleObjectsPlugin,
    ValidationPlugin,
  ],
  prisma: {
    dmmf: Prisma.dmmf,
    client: (ctx) => ctx.db as unknown as PrismaClient,
    filterConnectionTotalCount: true,
  },
  scopeAuthOptions: {
    authorizeOnSubscribe: true,
    treatErrorsAsUnauthorized: true,
    unauthorizedError: () => new PermissionDeniedError(),
  },
});

builder.queryType();
builder.mutationType();

builder.addScalarType('BigInt', GraphQLBigInt, {});
builder.addScalarType('DateTime', GraphQLDateTime, {});
builder.addScalarType('JSON', GraphQLJSON, {});
