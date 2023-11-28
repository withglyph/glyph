import type { PageLoadEvent } from './$types';

export const _SpaceDashboardPostsPage_QueryVariables = (event: PageLoadEvent) => {
  return { slug: event.params.space };
};
