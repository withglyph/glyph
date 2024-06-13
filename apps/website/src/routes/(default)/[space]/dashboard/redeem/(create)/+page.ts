import type { PageLoadEvent } from './$types';

export const _SpaceDashboardRedeemIndexPage_QueryVariables = (event: PageLoadEvent) => {
  return { slug: event.params.space };
};
