import type { PageLoadEvent } from './$types';

export const _SpaceAboutPage_QueryVariables = (event: PageLoadEvent) => {
  return { slug: event.params.space };
};
