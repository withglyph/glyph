import type { PageLoadEvent } from './$types';

export const _SpaceDashboardRedeemManageEntityPage_QueryVariables = (event: PageLoadEvent) => {
  return { permalink: event.params.redeem };
};
