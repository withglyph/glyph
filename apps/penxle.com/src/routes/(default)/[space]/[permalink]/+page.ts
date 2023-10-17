import type { PageLoadEvent } from './$types';

export const _SpacePermalinkPage_QueryVariables = (event: PageLoadEvent) => {
  return { permalink: event.params.permalink };
};
