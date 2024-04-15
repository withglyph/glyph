import type { PageLoadEvent } from './$types';

export const _EditorPermalinkPage_QueryVariables = (event: PageLoadEvent) => {
  return { permalink: event.params.permalink };
};
