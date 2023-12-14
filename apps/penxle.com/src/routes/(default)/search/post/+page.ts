import qs from 'query-string';
import type { ContentFilterCategory, OrderByKind } from '$glitch';
import type { PageLoadEvent } from './$types';

export const _SearchPostPage_QueryVariables = (event: PageLoadEvent) => {
  let includeTags: string[] = [];
  let excludeTags: string[] = [];
  const adultFilter =
    event.url.searchParams.get('adult') === '' ? null : JSON.parse(event.url.searchParams.get('adult') as string);
  let excludeContentFilters: ContentFilterCategory[] = [];
  let orderBy: OrderByKind = 'ACCURACY';

  if (qs.parseUrl(event.url.search)?.query) {
    const parsedURL = qs.parseUrl(event.url.search).query;

    if (parsedURL.include_tags) {
      if (typeof parsedURL.include_tags === 'string') {
        includeTags = [parsedURL.include_tags];
      } else if (typeof parsedURL.include_tags === 'object') {
        includeTags = parsedURL.include_tags as string[];
      }
    }

    if (parsedURL.exclude_tags) {
      if (typeof parsedURL.exclude_tags === 'string') {
        excludeTags = [parsedURL.exclude_tags];
      } else if (typeof parsedURL.exclude_tags === 'object') {
        excludeTags = parsedURL.exclude_tags as string[];
      }
    }

    if (parsedURL.exclude_triggers) {
      if (typeof parsedURL.exclude_triggers === 'string') {
        excludeContentFilters = [parsedURL.exclude_triggers] as ContentFilterCategory[];
      } else if (typeof parsedURL.exclude_triggers === 'object') {
        excludeContentFilters = parsedURL.exclude_triggers as ContentFilterCategory[];
      }
    }

    orderBy = parsedURL.order_by === 'LATEST' ? 'LATEST' : 'ACCURACY';
  }

  return {
    query: event.url.searchParams.get('q'),
    includeTags,
    excludeTags,
    adultFilter,
    excludeContentFilters,
    orderBy,
  };
};
