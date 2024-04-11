import { inArray as inArray_, notInArray as notInArray_, sql } from 'drizzle-orm';
import type { Column, GetColumnData, Placeholder, SQL, SQLWrapper } from 'drizzle-orm';

export function inArray<T>(column: SQL.Aliased<T>, values: (T | Placeholder)[] | SQLWrapper): SQL;
export function inArray<TColumn extends Column>(
  column: TColumn,
  values: (GetColumnData<TColumn, 'raw'> | Placeholder)[] | SQLWrapper,
): SQL;
export function inArray<T extends SQLWrapper>(
  column: Exclude<T, SQL.Aliased | Column>,
  values: (unknown | Placeholder)[] | SQLWrapper,
): SQL;
export function inArray(column: SQLWrapper, values: (unknown | Placeholder)[] | SQLWrapper): SQL {
  if (Array.isArray(values) && values.length === 0) {
    return sql`1 = 0`;
  }

  return inArray_(column, values);
}

export function notInArray<T>(column: SQL.Aliased<T>, values: (T | Placeholder)[] | SQLWrapper): SQL;
export function notInArray<TColumn extends Column>(
  column: TColumn,
  values: (GetColumnData<TColumn, 'raw'> | Placeholder)[] | SQLWrapper,
): SQL;
export function notInArray<T extends SQLWrapper>(
  column: Exclude<T, SQL.Aliased | Column>,
  values: (unknown | Placeholder)[] | SQLWrapper,
): SQL;
export function notInArray(column: SQLWrapper, values: (unknown | Placeholder)[] | SQLWrapper): SQL {
  if (Array.isArray(values) && values.length === 0) {
    return sql`1 = 1`;
  }

  return notInArray_(column, values);
}
