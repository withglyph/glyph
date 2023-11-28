import type { PageLoadEvent } from './$types';

export const _SpaceSettingPostsPage_QueryVariables = (event: PageLoadEvent) => {
  return { slug: event.params.space };
};
