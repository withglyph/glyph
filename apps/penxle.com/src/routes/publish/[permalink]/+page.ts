import type { PageLoadEvent } from './$types';

export const _Publish_Permalink_Page_QueryVariables = (event: PageLoadEvent) => {
  return { permalink: event.params.permalink };
};
