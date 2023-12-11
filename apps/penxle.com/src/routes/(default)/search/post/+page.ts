import type { PageLoadEvent } from './$types';

export const _SearchPostPage_QueryVariables = (event: PageLoadEvent) => {
  return { query: event.url.searchParams.get('q') };
};
