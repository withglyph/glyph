import type { PageLoadEvent } from './$types';

export const _SpacePostPage_QueryVariables = (event: PageLoadEvent) => {
  return { permalink: event.params.post };
};
