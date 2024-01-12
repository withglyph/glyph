import { trace } from '@opentelemetry/api';
import SchemaBuilder from '@pothos/core';
import PrismaPlugin from '@pothos/plugin-prisma';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects';
import TracingPlugin, { isRootField } from '@pothos/plugin-tracing';
import ValidationPlugin from '@pothos/plugin-validation';
import { createOpenTelemetryWrapper } from '@pothos/tracing-opentelemetry';
import { GraphQLDateTime, GraphQLJSON, GraphQLVoid } from 'graphql-scalars';
import { PermissionDeniedError } from '$lib/errors';
import { Prisma, PrismaClient } from '$prisma';
import type { PrismaPothosTypes } from '$prisma';
import type { Context, UserContext } from '../context';

const tracer = trace.getTracer('graphql');
const createSpan = createOpenTelemetryWrapper(tracer, {
  includeArgs: true,
  includeSource: true,
});

type Builder = ReturnType<typeof createBuilder>;
export const createBuilder = () => {
  const builder = new SchemaBuilder<{
    AuthContexts: {
      user: Context & UserContext;
    };
    AuthScopes: {
      staff: boolean;
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
      staff: false,
      user: !!context.session,
    }),
    defaultInputFieldRequiredness: true,
    plugins: [TracingPlugin, ScopeAuthPlugin, PrismaPlugin, SimpleObjectsPlugin, ValidationPlugin],
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
    tracing: {
      default: (config) => isRootField(config),
      wrap: (resolver, options) => createSpan(resolver, options),
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
