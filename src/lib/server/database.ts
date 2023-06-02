import { CamelCasePlugin, Kysely, sql } from 'kysely';
import { PlanetScaleDialect } from 'kysely-planetscale';
import { DATABASE_URL } from '$env/static/private';
import type { DB } from '$kysely';

export const db = new Kysely<DB>({
  dialect: new PlanetScaleDialect({
    url: DATABASE_URL,
    useSharedConnection: true,
  }),
  plugins: [new CamelCasePlugin()],
});

export const injectLoader = <T extends keyof DB>(tableName: T) => {
  return {
    load: async (ids: string[]) => {
      return await db
        .selectFrom<T>(tableName)
        .selectAll()
        .where(sql`id in (${ids})`)
        .orderBy('id', 'asc')
        .execute();
    },
    sort: (entity: { id: string }) => entity.id,
  };
};
