import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import winston from 'winston';
import { dev } from '$app/environment';
import { LOGTAIL_TOKEN, VERCEL_GIT_COMMIT_REF } from '$env/static/private';

export const logger = winston.createLogger({
  level: dev ? 'verbose' : 'info',
  defaultMeta: {
    environment: VERCEL_GIT_COMMIT_REF,
  },
  transports: [new LogtailTransport(new Logtail(LOGTAIL_TOKEN))],
});
