import type { PageLoadEvent } from './$types';

export const _SpaceDashboardIndexPage_QueryVariables = (event: PageLoadEvent) => {
  return { slug: event.params.space };
};
