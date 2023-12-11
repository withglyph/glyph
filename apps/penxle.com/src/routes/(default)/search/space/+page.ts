import type { PageLoadEvent } from './$types';

export const _SearchSpacePage_QueryVariables = (event: PageLoadEvent) => {
  return { query: event.url.searchParams.get('q') };
};
