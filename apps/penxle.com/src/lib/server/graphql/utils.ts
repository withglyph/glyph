import { asc, inArray } from 'drizzle-orm';
import { database } from '../database';
import type { PgColumn, PgTableWithColumns } from 'drizzle-orm/pg-core';

export const makeLoadableObjectFields = <
  T extends PgTableWithColumns<{
    name: string;
    dialect: 'pg';
    schema: undefined;
    columns: {
      id: PgColumn<{
        name: 'id';
        tableName: string;
        dataType: 'string';
        columnType: 'PgText';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        enumValues: [string, ...string[]];
      }>;
    };
  }>,
>(
  table: T,
) => ({
  load: (ids: string[]) => database.select().from(table).where(inArray(table.id, ids)).orderBy(asc(table.id)),
  sort: (parent: { id: string }) => parent.id,
});
