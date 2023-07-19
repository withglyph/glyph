import { z } from 'zod';
import * as errors from './errors';
import type { AppError } from './base';

const PortableAppErrorSchema = z.object({
  message: z.string(),
  extensions: z.object({
    __app: z.object({
      kind: z.nativeEnum(errors.AppErrorKind),
      extra: z.record(z.unknown()),
    }),
  }),
});

export type PortableAppError = z.infer<typeof PortableAppErrorSchema>;

export const isPortableAppError = (val: unknown): val is PortableAppError => {
  return PortableAppErrorSchema.safeParse(val).success;
};

export const serializeAppError = (error: AppError): PortableAppError => {
  return {
    message: error.message,
    extensions: {
      __app: {
        kind: error.name,
        extra: error.extra,
      },
    },
  };
};

export const deserializeAppError = ({
  message,
  extensions: {
    __app: { kind, extra },
  },
}: PortableAppError): AppError => {
  switch (kind) {
    case errors.AppErrorKind.UnknownError: {
      return new errors.UnknownError(
        extra.cause as errors.UnknownErrorCause | undefined,
      );
    }
    case errors.AppErrorKind.IntentionalError: {
      return new errors.IntentionalError(message);
    }
    case errors.AppErrorKind.PermissionDeniedError: {
      return new errors.PermissionDeniedError();
    }
    case errors.AppErrorKind.NotFoundError: {
      return new errors.NotFoundError();
    }
    case errors.AppErrorKind.FormValidationError: {
      return new errors.FormValidationError(extra.field as string, message);
    }
  }

  throw new Error('Unknown error kind');
};
