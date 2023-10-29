import type { LayoutLoadEvent } from './$types';

export const _SpaceDashboardLayout_QueryVariables = (event: LayoutLoadEvent) => {
  return { slug: event.params.space };
};
