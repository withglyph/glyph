import type { PageLoadEvent } from './$types';

export const _SpaceDashboardRedeemManageEntityPage_QueryVariables = (event: PageLoadEvent) => {
  return { id: event.params.redeem };
};
