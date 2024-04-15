import type { PageLoadEvent } from './$types';

export const _SpaceDashboardSettingsPage_QueryVariables = (event: PageLoadEvent) => {
  return { slug: event.params.space };
};
