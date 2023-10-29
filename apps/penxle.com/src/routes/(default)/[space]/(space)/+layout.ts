import type { LayoutLoadEvent } from './$types';

export const _SpaceLayout_QueryVariables = (event: LayoutLoadEvent) => {
  return { slug: event.params.space };
};
