import type { LayoutLoadEvent } from './$types';

export const _SpaceDashboardRedeemLayout_QueryVariables = (event: LayoutLoadEvent) => {
  return { slug: event.params.space };
};
