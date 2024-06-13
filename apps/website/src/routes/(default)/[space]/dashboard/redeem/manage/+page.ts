import type { PageLoadEvent } from './$types';

export const _SpaceDashboardRedeemManagePage_QueryVariables = (event: PageLoadEvent) => {
  return { slug: event.params.space };
};
