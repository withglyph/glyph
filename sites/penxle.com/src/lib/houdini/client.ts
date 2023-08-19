import { HoudiniClient } from '$houdini';
import { deserializeGraphQLError } from '$lib/errors';

// eslint-disable-next-line import/no-default-export
export default new HoudiniClient({
  url: '/api/graphql',
  throwOnError: {
    operations: ['all'],
    error: (errors) => deserializeGraphQLError(errors[0]),
  },
});
