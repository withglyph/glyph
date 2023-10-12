import type { LayoutLoadEvent } from './$types';

export const _SpaceSettingsLayout_QueryVariables = (event: LayoutLoadEvent) => {
  return { slug: event.params.space };
};
