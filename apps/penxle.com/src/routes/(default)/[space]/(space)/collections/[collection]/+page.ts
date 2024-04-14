import type { PageLoadEvent } from './$types';

export const _SpaceCollectionsEntityPage_QueryVariables = (event: PageLoadEvent) => {
  return { slug: event.params.collection };
};
