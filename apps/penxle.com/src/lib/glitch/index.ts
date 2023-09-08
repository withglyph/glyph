import { cacheExchange, createClient } from '@penxle/glitch';
import { deserializeGraphQLError } from '$lib/errors';

// eslint-disable-next-line import/no-default-export
export default () =>
  createClient({
    url: '/api/graphql',
    exchanges: [cacheExchange()],
    errorHandler: deserializeGraphQLError,
  });
