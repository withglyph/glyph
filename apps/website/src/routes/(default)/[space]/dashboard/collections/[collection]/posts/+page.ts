import type { PageLoadEvent } from './$types';

export const _SpaceDashboardCollectionsEntityPostsPage_QueryVariables = (event: PageLoadEvent) => {
  return { slug: event.params.collection };
};
