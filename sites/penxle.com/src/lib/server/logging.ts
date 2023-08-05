import winston from 'winston';
import { dev } from '$app/environment';
import { PUBLIC_VERCEL_GIT_COMMIT_REF } from '$env/static/public';

export const logger = winston.createLogger({
  level: dev ? 'verbose' : 'info',
  defaultMeta: {
    environment: PUBLIC_VERCEL_GIT_COMMIT_REF,
  },
  transports: [new winston.transports.Console()],
});
