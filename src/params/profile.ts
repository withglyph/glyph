import { ProfileHandleSchema } from '$lib/validations';
import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param) => {
  return ProfileHandleSchema.safeParse(param).success;
}) satisfies ParamMatcher;
