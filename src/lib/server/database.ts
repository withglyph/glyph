import { cast } from '@planetscale/database';
import { CamelCasePlugin, Kysely, sql } from 'kysely';
import { PlanetScaleDialect } from 'kysely-planetscale';
import { DATABASE_URL } from '$env/static/private';
import type { DB } from '$kysely';

export const db = new Kysely<DB>({
  dialect: new PlanetScaleDialect({
    url: DATABASE_URL,
    useSharedConnection: true,
    cast: (field, value) => {
      if (value === '' || value === null) {
        return value;
      }

      if (field.type === 'VARBINARY') {
        const data = Uint8Array.from(value, (x) => x.codePointAt(0)!);
        return new TextDecoder().decode(data);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return cast(field, value);
    },
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
        .orderBy(sql`id`, 'asc')
        .execute();
    },
    sort: (entity: { id: string }) => entity.id,
  };
};
