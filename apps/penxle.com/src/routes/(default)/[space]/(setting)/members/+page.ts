import type { PageLoadEvent } from './$types';

export const _SpaceSettingMembersPage_QueryVariables = (event: PageLoadEvent) => {
  return { slug: event.params.space };
};
