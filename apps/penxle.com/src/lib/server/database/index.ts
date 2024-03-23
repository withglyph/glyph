import { Kysely } from 'kysely';
import { PostgresJSDialect } from 'kysely-postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import type { DB } from './types';

export const db = new Kysely<DB>({
  dialect: new PostgresJSDialect({
    postgres: postgres(env.PRIVATE_DATABASE_URL, {
      transform: {
        ...postgres.camel,
      },
    }),
  }),
});
