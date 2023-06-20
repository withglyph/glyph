import * as Sentry from '@sentry/sveltekit';
import { dev } from '$app/environment';
import {
  PUBLIC_SENTRY_DSN,
  PUBLIC_VERCEL_GIT_COMMIT_REF,
} from '$env/static/public';
import { setupDayjs } from '$lib/datetime';
import {
  AppError,
  NotFoundError,
  serializeAppError,
  UnknownError,
} from '$lib/errors';
import type { HandleClientError, HandleServerError } from '@sveltejs/kit';

export const setupGlobals = () => {
  Sentry.init({
    enabled: !dev,
    dsn: PUBLIC_SENTRY_DSN,
    environment: PUBLIC_VERCEL_GIT_COMMIT_REF,
  });
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
    return serializeAppError(new UnknownError());
  }
}) satisfies HandleServerError & HandleClientError;

export const handleError = Sentry.handleErrorWithSentry(_handleError);
