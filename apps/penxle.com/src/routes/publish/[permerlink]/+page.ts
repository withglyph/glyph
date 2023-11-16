import type { PageLoadEvent } from '../$types';

export const _Publish_PermalinkPage_QueryVariables = (event: PageLoadEvent) => {
  return { permalink: event.params.permalink };
};
