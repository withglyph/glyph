import type { PageLoadEvent } from './$types';

export const _TagPage_QueryVariables = (event: PageLoadEvent) => {
  return { name: event.params.name };
};
