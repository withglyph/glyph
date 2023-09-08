import type { PageLoadEvent } from './$types';

export const _SpacePublishArtworkPage_QueryVariables = (
  event: PageLoadEvent,
) => {
  return { slug: event.params.space };
};
