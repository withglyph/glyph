import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pino from 'pino';
import { dev } from '$app/environment';
import { LOGTAIL_TOKEN, VERCEL_GIT_COMMIT_REF } from '$env/static/private';

export const logger = pino({
  base: {
    environment: VERCEL_GIT_COMMIT_REF,
  },
  level: dev ? 'trace' : 'info',
  transport: dev
    ? {
        target: resolve(
          dirname(fileURLToPath(import.meta.url)),
          'transport.js'
        ),
      }
    : {
        target: '@logtail/pino',
        options: {
          sourceToken: LOGTAIL_TOKEN,
        },
      },
});
