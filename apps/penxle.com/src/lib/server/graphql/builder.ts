import SchemaBuilder from '@pothos/core';
import PrismaPlugin from '@pothos/plugin-prisma';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects';
import ValidationPlugin from '@pothos/plugin-validation';
import { GraphQLDateTime, GraphQLJSON, GraphQLVoid } from 'graphql-scalars';
import { PermissionDeniedError } from '$lib/errors';
import { Prisma, PrismaClient } from '$prisma';
import type { PrismaPothosTypes } from '$prisma';
import type { Context, UserContext } from '../context';

type Builder = ReturnType<typeof createBuilder>;
export const createBuilder = () => {
  const builder = new SchemaBuilder<{
    AuthContexts: {
      admin: Context & UserContext;
      user: Context & UserContext;
    };
    AuthScopes: {
      admin: boolean;
      user: boolean;
    };
    Context: Context;
    DefaultInputFieldRequiredness: true;
    PrismaTypes: PrismaPothosTypes;
    Scalars: {
      DateTime: { Input: Date; Output: Date };
      ID: { Input: string; Output: string };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      JSON: { Input: any; Output: unknown };
      // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
      Void: { Input: never; Output: void };
    };
  }>({
    authScopes: (context) => ({
      admin: context.session?.role === 'ADMIN',
      user: !!context.session,
    }),
    defaultInputFieldRequiredness: true,
    plugins: [ScopeAuthPlugin, PrismaPlugin, SimpleObjectsPlugin, ValidationPlugin],
    prisma: {
      // spell-checker:disable-next-line
      dmmf: Prisma.dmmf,
      client: (ctx) => ctx.db as unknown as PrismaClient,
      filterConnectionTotalCount: true,
    },
    scopeAuthOptions: {
      treatErrorsAsUnauthorized: true,
      unauthorizedError: () => new PermissionDeniedError(),
    },
  });

  builder.queryType();
  builder.mutationType();

  builder.addScalarType('DateTime', GraphQLDateTime);
  builder.addScalarType('JSON', GraphQLJSON);
  builder.addScalarType('Void', GraphQLVoid);

  return builder;
};

export const defineSchema = (fn: (builder: Builder) => void) => fn;

export const addSchema = (builder: Builder, schemas: ((builder: Builder) => void)[]) => {
  for (const schema of schemas) {
    schema(builder);
  }
};
