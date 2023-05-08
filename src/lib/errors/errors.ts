/* eslint-disable unicorn/custom-error-definition */

import { production } from '$lib/environment';
import { AppError } from './base';

export enum AppErrorKind {
  UnknownError = 'UnknownError',
  IntentionalError = 'IntentionalError',
  PermissionDeniedError = 'PermissionDeniedError',
  NotFoundError = 'NotFoundError',
  FormValidationError = 'FormValidationError',
}

export type UnknownErrorCause = {
  name: string;
  message: string;
  stack?: string;
};
export class UnknownError extends AppError {
  public readonly cause?: UnknownErrorCause;

  constructor(cause?: UnknownErrorCause) {
    if (cause) {
      cause = production
        ? undefined
        : {
            name: cause.name,
            message: cause.message,
            stack: cause.stack,
          };
    }

    super({
      kind: AppErrorKind.UnknownError,
      message: '알 수 없는 오류가 발생했어요',
      extra: { cause },
    });

    this.cause = cause;
  }
}

export class IntentionalError extends AppError {
  constructor(message: string) {
    super({
      kind: AppErrorKind.IntentionalError,
      message,
    });
  }
}

export class PermissionDeniedError extends AppError {
  constructor() {
    super({
      kind: AppErrorKind.PermissionDeniedError,
      message: '권한이 없어요',
      extra: { code: 403 },
    });
  }
}

export class NotFoundError extends AppError {
  constructor() {
    super({
      kind: AppErrorKind.NotFoundError,
      message: '페이지를 찾을 수 없어요',
      extra: { code: 404 },
    });
  }
}

export class FormValidationError extends AppError {
  public readonly field: string;

  constructor(field: string, message: string) {
    super({
      kind: AppErrorKind.FormValidationError,
      message,
      extra: { field },
    });

    this.field = field;
  }
}
