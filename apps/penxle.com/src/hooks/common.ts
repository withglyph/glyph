import { production } from '@penxle/lib/environment';
import * as Sentry from '@sentry/sveltekit';
import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import { setupDayjs } from '$lib/datetime';
import { AppError, NotFoundError, serializeAppError, UnknownError } from '$lib/errors';
import type { HandleClientError, HandleServerError } from '@sveltejs/kit';

const setupSentry = () => {
  const integrations = [];

  if (browser) {
    // no-op
  } else {
    integrations.push(
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection({ mode: 'strict' }),
      new Sentry.Integrations.LocalVariables({ captureAllExceptions: true }),
    );
  }

  if (production) {
    Sentry.init({
      dsn: env.PUBLIC_SENTRY_DSN,
      integrations,
    });
  }
};

export const setupGlobals = () => {
  setupSentry();
  setupDayjs();
};

export const handleError = (({ error, event }) => {
  if (event.route.id === null) {
    return serializeAppError(new NotFoundError());
  } else if (error instanceof AppError) {
    return serializeAppError(error);
  } else if (error instanceof Error) {
    return serializeAppError(new UnknownError(error));
  } else {
    return serializeAppError(
      new UnknownError({
        name: 'UnknownError (inferred)',
        message: JSON.stringify(error),
      }),
    );
  }
}) satisfies HandleServerError & HandleClientError;
