import type { PageLoadEvent } from './$types';

export const _SpaceDashboardRedeemCreatePage_QueryVariables = (event: PageLoadEvent) => {
  return { slug: event.params.space };
};
