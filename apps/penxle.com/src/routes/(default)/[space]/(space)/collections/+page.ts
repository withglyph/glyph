import type { PageLoadEvent } from './$types';

export const _SpaceCollectionsPage_QueryVariables = (event: PageLoadEvent) => {
  return { slug: event.params.space };
};
