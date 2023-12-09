import { trace } from '@opentelemetry/api';
import SchemaBuilder from '@pothos/core';
import PrismaPlugin from '@pothos/plugin-prisma';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects';
import TracingPlugin, { isRootField } from '@pothos/plugin-tracing';
import ValidationPlugin from '@pothos/plugin-validation';
import { createOpenTelemetryWrapper } from '@pothos/tracing-opentelemetry';
import { Prisma, PrismaClient } from '@prisma/client';
import { GraphQLDateTime, GraphQLJSON, GraphQLVoid } from 'graphql-scalars';
import { dev } from '$app/environment';
import { PermissionDeniedError } from '$lib/errors';
import { logger } from '../logging';
import type PrismaTypes from '@pothos/plugin-prisma/generated';
import type { Context, UserContext } from '../context';

// 개발환경에서만 강제로 순환 참조 걸어서 ./schemas/**/* 리로드할 때 HMR이 builder까지 리로드하도록 함
if (dev) {
  import('./schemas');
}

const tracer = trace.getTracer('graphql');
const createSpan = createOpenTelemetryWrapper(tracer, {
  includeArgs: true,
  includeSource: true,
});

export const builder = new SchemaBuilder<{
  AuthContexts: {
    user: Context & UserContext;
  };
  AuthScopes: {
    staff: boolean;
    user: boolean;
  };
  Context: Context;
  DefaultInputFieldRequiredness: true;
  PrismaTypes: PrismaTypes;
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
    unauthorizedError: (_, __, ___, result) => {
      logger.warn(result);
      return new PermissionDeniedError();
    },
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
