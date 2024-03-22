import type { PgEnum } from 'drizzle-orm/pg-core';

export type DbEnum<T> = T extends PgEnum<infer U> ? U[number] : never;

export const dbEnum = <T extends [string, ...string[]]>(enumType: PgEnum<T>): { [K in T[number]]: K } => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Object.fromEntries(enumType.enumValues.map((value) => [value, value])) as any;
};
