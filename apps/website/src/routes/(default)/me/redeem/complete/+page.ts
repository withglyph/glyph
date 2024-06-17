import qs from 'query-string';
import type { PageLoadEvent } from './$types';

export const _MeRedeemCompletePage_QueryVariables = (event: PageLoadEvent) => {
  const parsedURL = qs.parseUrl(event.url.search).query;
  return { id: parsedURL.id };
};
