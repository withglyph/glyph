import type { PageLoadEvent } from './$types';

export const _WebViewPostViewPermalinkPage_QueryVariables = (event: PageLoadEvent) => {
  return { permalink: event.params.permalink };
};
