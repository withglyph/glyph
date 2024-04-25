import type { PageLoadEvent } from './$types';

export const _MeCabinetsCommentsPage_QueryVariables = (event: PageLoadEvent) => {
  const page = Number(event.url.searchParams.get('page')) || 1;

  return { page, take: 10 };
};
