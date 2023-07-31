import EventEmitter from 'node:events';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import winston from 'winston';
import { dev } from '$app/environment';
import { PRIVATE_LOGTAIL_TOKEN } from '$env/static/private';
import { PUBLIC_VERCEL_GIT_COMMIT_REF } from '$env/static/public';

EventEmitter.setMaxListeners(100);

export const logger = winston.createLogger({
  level: dev ? 'verbose' : 'info',
  defaultMeta: {
    environment: PUBLIC_VERCEL_GIT_COMMIT_REF,
  },
  transports: [new LogtailTransport(new Logtail(PRIVATE_LOGTAIL_TOKEN))],
});
