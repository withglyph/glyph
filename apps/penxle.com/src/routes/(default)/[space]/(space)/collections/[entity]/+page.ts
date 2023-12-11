import type { PageLoadEvent } from './$types';

export const _SpaceCollectionsEnitityPage_QueryVariables = (event: PageLoadEvent) => {
  return { slug: event.params.space };
};
