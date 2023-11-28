import type { LayoutLoadEvent } from './$types';

export const _SpaceSettingPostsLayout_QueryVariables = (event: LayoutLoadEvent) => {
  return { slug: event.params.space };
};
