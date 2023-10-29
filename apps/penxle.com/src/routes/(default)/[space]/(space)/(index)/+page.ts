import type { PageLoadEvent } from './$types';

export const _SpacePage_QueryVariables = (event: PageLoadEvent) => {
  return { slug: event.params.space };
};
