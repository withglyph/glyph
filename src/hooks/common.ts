import * as Sentry from '@sentry/sveltekit';
import { PUBLIC_SENTRY_DSN } from '$env/static/public';
import { setupDayjs } from '$lib/datetime';
import {
  AppError,
  NotFoundError,
  serializeAppError,
  UnknownError,
} from '$lib/errors';
import type { HandleClientError, HandleServerError } from '@sveltejs/kit';

export const setupGlobals = () => {
  Sentry.init({ dsn: PUBLIC_SENTRY_DSN });
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
