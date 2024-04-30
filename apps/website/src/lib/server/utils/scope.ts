import type { PgTable } from 'drizzle-orm/pg-core';
import type { Context } from '$lib/server/context';

type TableDataWithId<P extends PgTable> = { id: string } & P['$inferSelect'];

export type ScopeFn<P extends PgTable, S extends string> = (data: TableDataWithId<P>, context: Context) => Promise<S[]>;

export const defineScopeGranter = <P extends PgTable, S extends string>(table: P, granter: ScopeFn<P, S>) => {
  return async (data: TableDataWithId<P>, context: Context, scope: S) => {
    const scopes = await granter(data, context);
    return scopes.includes(scope);
  };
};
