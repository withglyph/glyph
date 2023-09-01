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
  public override readonly name: AppErrorKind;
  public readonly extra: AppErrorExtra;

  constructor({ kind, message, extra = {} }: AppErrorConstructorParams) {
    super(message);

    this.name = kind;
    this.extra = extra;
  }
}
