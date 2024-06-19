import qs from 'query-string';
import type { PageLoadEvent } from './$types';

export const _SpaceDashboardRedeemCompletePage_QueryVariables = (event: PageLoadEvent) => {
  return { id: qs.parseUrl(event.url.search).query.id };
};
