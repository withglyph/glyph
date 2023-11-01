import { createClient } from '@penxle/glitch';
import * as Sentry from '@sentry/sveltekit';
import { AppError, deserializeGraphQLError } from '$lib/errors';
import { toast } from '$lib/notification';
import { keys } from './keys';
import { optimistic } from './optimistic';
import { updates } from './updates';

// eslint-disable-next-line import/no-default-export
export default createClient({
  url: '/api/graphql',
  cache: { keys, optimistic, updates },
  transformError: deserializeGraphQLError,
  onMutationError: (error) => {
    if (error instanceof AppError) {
      if (!error.extra.internal) {
        toast.error(error.message);
      }
    } else {
      console.error(error);
      Sentry.captureException(error);
      toast.error('알 수 없는 오류가 발생했어요');
    }
  },
});
