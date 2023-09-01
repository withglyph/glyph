import { GraphQLError } from 'graphql';
import { UnknownError } from './errors';
import { deserializeAppError, isPortableAppError } from './serde';
import type { AppError } from './base';
import type { PortableAppError } from './serde';

export const deserializeGraphQLError = (error: unknown) => {
  if (isPortableAppError(error)) {
    return deserializeAppError(error);
  } else if (error instanceof Error) {
    return new UnknownError(error);
  } else {
    return new UnknownError({
      name: 'UnknownError (inferred)',
      message: JSON.stringify(error),
    });
  }
};

export class GraphQLAppError extends GraphQLError implements PortableAppError {
  public override readonly extensions: PortableAppError['extensions'];

  constructor(error: AppError) {
    super(error.message);

    this.name = error.name;

    this.extensions = {
      __app: {
        kind: error.name,
        extra: error.extra,
      },
    };
  }
}
