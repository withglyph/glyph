import type { PageLoadEvent } from './$types';

export const _PointPurchaseCompletePage_QueryVariables = (event: PageLoadEvent) => {
  return { paymentKey: event.url.searchParams.get('paymentKey') };
};
