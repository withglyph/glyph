import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param) => {
  return /^\d+$/.test(param);
}) satisfies ParamMatcher;
