import type { PageLoadEvent } from './$types';

export const _SpacePurchasedPostPage_QueryVariables = (event: PageLoadEvent) => {
  return { permalink: event.params.post };
};
