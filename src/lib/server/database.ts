import { CamelCasePlugin, Kysely } from 'kysely';
import { PlanetScaleDialect } from 'kysely-planetscale';
import { DATABASE_URL } from '$env/static/private';
import type { DB } from '$kysely';
import type { TableExpression } from 'kysely';

export const db = new Kysely<DB>({
  dialect: new PlanetScaleDialect({
    url: DATABASE_URL,
    useSharedConnection: true,
  }),
  plugins: [new CamelCasePlugin()],
});

export const injectLoader = <T extends TableExpression<DB, keyof DB>>(
  tableName: T
) => {
  return {
    load: async (ids: string[]) => {
      return await db
        .selectFrom(tableName)
        .selectAll()
        // @ts-expect-error: id는 늘 있다고 가정함
        .where('id', 'in', ids)
        // @ts-expect-error: id는 늘 있다고 가정함
        .orderBy('id', 'asc')
        .execute();
    },
    sort: (entity: { id: string }) => entity.id,
  };
};
