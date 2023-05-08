import { setupDayjs } from '$lib/datetime';
import {
  AppError,
  NotFoundError,
  serializeAppError,
  UnknownError,
} from '$lib/errors';
import type { HandleClientError, HandleServerError } from '@sveltejs/kit';

export const setupGlobals = () => {
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
    return serializeAppError(new UnknownError());
  }
}) satisfies HandleServerError & HandleClientError;
