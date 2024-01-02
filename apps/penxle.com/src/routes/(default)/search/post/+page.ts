import { initSearchFilter } from '../util';
import type { PageLoadEvent } from './$types';

export const _SearchPostPage_QueryVariables = (event: PageLoadEvent) => {
  const { includeTags, excludeTags, adultFilter, excludeContentFilters, orderBy, page } = initSearchFilter(
    event.url.search,
  );

  return {
    query: event.url.searchParams.get('q'),
    includeTags,
    excludeTags,
    adultFilter,
    excludeContentFilters,
    orderBy,
    page,
  };
};
