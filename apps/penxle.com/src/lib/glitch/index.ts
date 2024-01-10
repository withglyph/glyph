import { createClient } from '@penxle/glitch';
import { AppError, UnknownError } from '$lib/errors';
import { toast } from '$lib/notification';
import { keys } from './keys';
import { optimistic } from './optimistic';
import { updates } from './updates';

// eslint-disable-next-line import/no-default-export
export default createClient({
  url: '/api/graphql',
  cache: { keys, optimistic, updates },
  transformError: AppError.deserialize,
  onMutationError: (error) => {
    if (!error.extra.internal) {
      if (error instanceof UnknownError && error.id) {
        toast.error(error.id, {
          title: error.message,
        });
      } else {
        toast.error(error.message);
      }
    }
  },
});
