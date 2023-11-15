import type { PageLoadEvent } from './$types';

export const _SpacePreviewPostPage_QueryVariables = (event: PageLoadEvent) => {
  return { permalink: event.params.post };
};
