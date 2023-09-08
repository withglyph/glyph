import type { PageLoadEvent } from './$types';

export const _SpacePublishPostPage_QueryVariables = (event: PageLoadEvent) => {
  return { slug: event.params.space };
};
