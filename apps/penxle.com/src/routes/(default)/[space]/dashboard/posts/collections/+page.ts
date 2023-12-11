import type { PageLoadEvent } from './$types';

export const _SpaceSettingCollectionPage_QueryVariables = (event: PageLoadEvent) => {
  return { slug: event.params.space };
};
