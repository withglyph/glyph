import type { PageLoadEvent } from './$types';

export const _SpaceDashboardRedeemManageEntityPage_QueryVariables = (event: PageLoadEvent) => {
  const page = Number(event.url.searchParams.get('page')) || 1;

  return { id: event.params.redeem, page, take: 10 };
};
