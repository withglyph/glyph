import qs from 'query-string';
import type { PageLoadEvent } from './$types';

export const _SpaceCollectionsEntityPage_QueryVariables = (event: PageLoadEvent) => {
  const parsedURL = qs.parseUrl(event.url.search).query;
  return { slug: event.params.collection, order: parsedURL.order === 'OLDEST' ? 'OLDEST' : 'LATEST' };
};
