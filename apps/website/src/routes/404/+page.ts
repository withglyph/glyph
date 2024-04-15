import { NotFoundError } from '$lib/errors';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  throw new NotFoundError();
};
