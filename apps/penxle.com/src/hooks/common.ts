import * as Sentry from '@sentry/sveltekit';
import { browser, dev } from '$app/environment';
import { PUBLIC_SENTRY_DSN } from '$env/static/public';
import { setupDayjs } from '$lib/datetime';
import {
  AppError,
  NotFoundError,
  serializeAppError,
  UnknownError,
} from '$lib/errors';
import type { HandleClientError, HandleServerError } from '@sveltejs/kit';

const setupSentry = () => {
  const integrations = [];

  if (browser) {
    integrations.push(new Sentry.Replay({}));
  } else {
    integrations.push(
      new Sentry.Integrations.OnUncaughtException({}),
      new Sentry.Integrations.OnUnhandledRejection({ mode: 'strict' }),
      new Sentry.Integrations.LocalVariables({ captureAllExceptions: true }),
    );
  }

  if (!dev) {
    Sentry.init({
      dsn: PUBLIC_SENTRY_DSN,
      integrations,
      tracesSampleRate: 1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1,
    });
  }
};

export const setupGlobals = () => {
  setupSentry();
  setupDayjs();
};

const _handleError = (({ error, event }) => {
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

export const handleError = Sentry.handleErrorWithSentry(_handleError);
