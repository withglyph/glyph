import { GraphQLError } from 'graphql';
import { UnknownError } from './errors';
import { deserializeAppError, isPortableAppError } from './serde';
import type { AppError } from './base';
import type { PortableAppError } from './serde';

export const deserializeGraphQLError = (error: unknown) => {
  return isPortableAppError(error)
    ? deserializeAppError(error)
    : new UnknownError();
};

export class GraphQLAppError extends GraphQLError implements PortableAppError {
  public readonly extensions: PortableAppError['extensions'];

  constructor(error: AppError) {
    super(error.message);
    // eslint-disable-next-line unicorn/custom-error-definition
    this.name = error.name;

    this.extensions = {
      __app: {
        kind: error.name,
        extra: error.extra,
      },
    };
  }
}
