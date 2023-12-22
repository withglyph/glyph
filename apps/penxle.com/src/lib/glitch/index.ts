import { createClient } from '@penxle/glitch';
import { AppError } from '$lib/errors';
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
      toast.error(error.message);
    }
  },
});
