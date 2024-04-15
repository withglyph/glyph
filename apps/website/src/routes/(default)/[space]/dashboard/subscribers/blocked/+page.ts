import type { PageLoadEvent } from './$types';

export const _SpaceDashboardSubscribersBlockedPage_QueryVariables = (event: PageLoadEvent) => {
  return { slug: event.params.space };
};
