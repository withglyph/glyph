import { HoudiniClient } from '$houdini';
import { deserializeGraphQLError } from '$lib/errors';

export default new HoudiniClient({
  url: '/api/graphql',
  throwOnError: {
    operations: ['all'],
    error: (errors) => deserializeGraphQLError(errors[0]),
  },
});
