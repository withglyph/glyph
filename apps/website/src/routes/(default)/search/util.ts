import qs from 'query-string';
import type { ContentFilterCategory } from '$lib/enums';

export const initSearchFilter = (param: string) => {
  let includeTags: string[] = [];
  let excludeTags: string[] = [];
  let adultFilter: boolean | null = null;
  let excludeContentFilters: ContentFilterCategory[] = [];
  let orderBy: 'ACCURACY' | 'LATEST' = 'ACCURACY';
  let page = 1;

  const parsedURL = qs.parseUrl(param).query;

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

  adultFilter = parsedURL.adult ? JSON.parse(parsedURL.adult.toString()) : null;

  if (parsedURL.exclude_triggers) {
    if (typeof parsedURL.exclude_triggers === 'string') {
      excludeContentFilters = [parsedURL.exclude_triggers] as ContentFilterCategory[];
    } else if (typeof parsedURL.exclude_triggers === 'object') {
      excludeContentFilters = parsedURL.exclude_triggers as ContentFilterCategory[];
    }
  }

  orderBy = parsedURL.order_by === 'LATEST' ? 'LATEST' : 'ACCURACY';

  page = parsedURL.page ? Number(parsedURL.page) : 1;

  return { includeTags, excludeTags, adultFilter, excludeContentFilters, orderBy, page };
};
