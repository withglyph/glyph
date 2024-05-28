import type { PageLoadEvent } from './$types';

export const _SpaceDashboardCollectionsEntityPage_QueryVariables = (event: PageLoadEvent) => {
  return { slug: event.params.collection };
};
