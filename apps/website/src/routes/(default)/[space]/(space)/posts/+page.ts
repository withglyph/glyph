import type { PageLoadEvent } from './$types';

export const _SpacePostsPage_QueryVariables = (event: PageLoadEvent) => {
  return { slug: event.params.space };
};
