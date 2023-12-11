import type { PageLoadEvent } from './$types';

export const _SearchPostPage_QueryVariables = (event: PageLoadEvent) => {
  const includeTags = event.url.searchParams.get('include_tags') ?? [];
  const excludeTags = event.url.searchParams.get('exclude_tags') ?? [];
  const adult = event.url.searchParams.get('adult') === '' ? null : Boolean(event.url.searchParams.get('adult'));
  const excludeTriggers = event.url.searchParams.get('exclude_triggers');
  const orderBy = event.url.searchParams.get('order_by') ?? 'ACCURACY';

  return {
    query: event.url.searchParams.get('q'),
    includeTags,
    excludeTags,
    adultFilter: adult,
    excludeContentFilters: excludeTriggers,
    orderBy,
  };
};
