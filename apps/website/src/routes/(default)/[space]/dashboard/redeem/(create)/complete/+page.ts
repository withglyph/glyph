import qs from 'query-string';
import type { PageLoadEvent } from './$types';

export const _SpaceDashboardRedeemCompletePage_QueryVariables = (event: PageLoadEvent) => {
  const page = Number(event.url.searchParams.get('page')) || 1;

  return { id: qs.parseUrl(event.url.search).query.id, page, take: 10 };
};
