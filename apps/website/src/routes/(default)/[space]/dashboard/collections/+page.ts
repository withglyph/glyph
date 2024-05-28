import type { PageLoadEvent } from './$types';

export const _SpaceDashboardCollectionsPage_QueryVariables = (event: PageLoadEvent) => {
  return { slug: event.params.space };
};
