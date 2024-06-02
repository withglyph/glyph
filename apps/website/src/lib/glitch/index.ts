import { error as throwError } from '@sveltejs/kit';
import { createClient } from '@withglyph/glitch';
import { AppError, PortableAppErrorSchema } from '$lib/errors';
import { keys } from './keys';
import { optimistic } from './optimistic';
import { updates } from './updates';
import type { HttpError } from '@sveltejs/kit';

// eslint-disable-next-line import/no-default-export
export default createClient({
  url: '/api/graphql',
  cache: { keys, optimistic, updates },
  transformError: (type, error) => {
    if (type === 'mutation') {
      return AppError.deserialize(error);
    } else {
      const r = PortableAppErrorSchema.safeParse(error);
      try {
        if (r.success) {
          throwError(r.data.extensions.__app.extra.code ?? 500, r.data);
        } else {
          throwError(500);
        }
      } catch (err) {
        return err as HttpError;
      }
    }
  },
  onMutationError: (error) => {
    if (error instanceof AppError && !error.extra.internal) {
      // toast.error(error.message);
      console.error(error);
    }
  },
});
