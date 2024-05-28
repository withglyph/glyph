import type { LayoutLoadEvent } from './$types';

export const _SpaceDashboardCollectionsEntityLayout_QueryVariables = (event: LayoutLoadEvent) => {
  return { slug: event.params.collection };
};
