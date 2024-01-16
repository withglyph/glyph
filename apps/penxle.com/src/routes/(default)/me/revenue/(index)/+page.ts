import type { PageLoadEvent } from './$types';

export const _MeRevenuePage_QueryVariables = (event: PageLoadEvent) => {
  const page = Number(event.url.searchParams.get('page')) || 1;

  return { page, take: 10 };
};
