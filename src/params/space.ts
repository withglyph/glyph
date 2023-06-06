import { SpaceSlugSchema } from '$lib/validations';
import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param) => {
  return SpaceSlugSchema.safeParse(param).success;
}) satisfies ParamMatcher;
