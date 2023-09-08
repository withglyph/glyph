import { Client } from '@urql/core';
import type { Exchange } from '@urql/core';
import type { GlitchClient } from '../types';

type CreateClientParams = {
  url: string;
  exchanges: Exchange[];
  errorHandler: (error: unknown) => Error;
};

export const createClient = ({
  url,
  exchanges,
  errorHandler,
}: CreateClientParams): GlitchClient => {
  return {
    client: new Client({
      url,
      exchanges,
    }),
    errorHandler,
  };
};
