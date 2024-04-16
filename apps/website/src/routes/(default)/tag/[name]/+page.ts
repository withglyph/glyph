import qs from 'query-string';
import type { PageLoadEvent } from './$types';

export const _TagPage_QueryVariables = (event: PageLoadEvent) => {
  const parsedURL = qs.parseUrl(event.url.search).query;
  return { name: event.params.name, page: parsedURL.page ? Number(parsedURL.page) : 1 };
};
