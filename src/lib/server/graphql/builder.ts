import SchemaBuilder from '@pothos/core';
// eslint-disable-next-line import/no-named-as-default
import PrismaPlugin from '@pothos/plugin-prisma';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects';
import ValidationPlugin from '@pothos/plugin-validation';
import { GraphQLDateTime, GraphQLJSON, GraphQLVoid } from 'graphql-scalars';
import { dev } from '$app/environment';
import { PermissionDeniedError } from '$lib/errors';
import { db } from '../database';
import type { AuthContext, Context } from './context';
import type PrismaTypes from '@pothos/plugin-prisma/generated';

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
  };
  Context: Context;
  DefaultInputFieldRequiredness: true;
  PrismaTypes: PrismaTypes;
  Scalars: {
    DateTime: { Input: Date; Output: Date };
    JSON: { Input: unknown; Output: unknown };
    Void: { Input: never; Output: boolean };
  };
}>({
  authScopes: (context) => ({
    auth: !!context.session,
  }),
  defaultInputFieldRequiredness: true,
  plugins: [
    PrismaPlugin,
    ScopeAuthPlugin,
    SimpleObjectsPlugin,
    ValidationPlugin,
  ],
  prisma: {
    client: db,
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
builder.subscriptionType();

builder.addScalarType('DateTime', GraphQLDateTime, {});
builder.addScalarType('JSON', GraphQLJSON, {});
builder.addScalarType('Void', GraphQLVoid, {});
