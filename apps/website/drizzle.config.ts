import type { Config } from 'drizzle-kit';

export default {
  strict: true,
  verbose: true,

  schema: './src/lib/server/database/schemas/*',
  out: './drizzle',

  dialect: 'postgresql',
  dbCredentials: {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    url: process.env.PRIVATE_DATABASE_DIRECT_URL!,
  },

  breakpoints: false,
} satisfies Config;
