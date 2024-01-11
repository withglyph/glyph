import * as Sentry from '@sentry/sveltekit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import { setupDayjs } from '$lib/datetime';
import { AppError, NotFoundError, UnknownError } from '$lib/errors';
import type { HandleClientError, HandleServerError } from '@sveltejs/kit';

const setupSentry = () => {
  if (!dev) {
    Sentry.init({
      dsn: env.PUBLIC_SENTRY_DSN,
      environment: env.PUBLIC_PULUMI_STACK,
    });
  }
};

export const setupGlobals = () => {
  setupSentry();
  setupDayjs();
};

export const handleError = (({ error, event }) => {
  let err;

  if (event.route.id === null) {
    err = new NotFoundError();
  } else if (error instanceof AppError) {
    err = error;
  } else {
    err = new UnknownError(error);
  }

  return err.serialize();
}) satisfies HandleServerError & HandleClientError;
