import type { PageLoadEvent } from './$types';

export const _SpaceDashboardMembersPage_QueryVariables = (event: PageLoadEvent) => {
  return { slug: event.params.space };
};
