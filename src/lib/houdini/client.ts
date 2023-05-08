import { HoudiniClient, subscription } from '$houdini';
import { deserializeGraphQLError } from '$lib/errors';
import { sse } from './subscription';

// eslint-disable-next-line import/no-default-export
export default new HoudiniClient({
  url: '/api/graphql',
  plugins: [subscription(sse({ url: '/api/graphql/stream' }))],
  throwOnError: {
    operations: ['all'],
    error: (errors) => deserializeGraphQLError(errors[0]),
  },
});
