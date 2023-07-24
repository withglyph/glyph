import type { AppErrorKind } from './errors';

export type AppErrorExtra = {
  [key: string]: unknown;
  code?: number;
};

export type AppErrorConstructorParams = {
  kind: AppErrorKind;
  message: string;
  extra?: AppErrorExtra;
};

export class AppError extends Error {
  public readonly name: AppErrorKind;
  public readonly extra: AppErrorExtra;

  constructor({ kind, message, extra = {} }: AppErrorConstructorParams) {
    super(message);

    // eslint-disable-next-line unicorn/custom-error-definition
    this.name = kind;
    this.extra = extra;
  }
}
