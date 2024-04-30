import type { PgTable, TableConfig } from 'drizzle-orm/pg-core';
import type { Context } from '$lib/server/context';

export type ScopeFn<C extends TableConfig, P extends PgTable<C>> = (
  data: P['$inferSelect'],
  context: Context,
) => Promise<string[]>;

export const defineScopeGranter = <C extends TableConfig, P extends PgTable<C>>(table: P, granter: ScopeFn<C, P>) => {
  return async (data: P['$inferSelect'], context: Context, scope: string) => {
    const scopes = await granter(data, context);
    return scopes.includes(scope);
  };
};
