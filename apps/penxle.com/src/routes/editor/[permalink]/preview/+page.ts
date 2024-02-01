import type { PageLoadEvent } from './$types';

export const _EditorPermalinkPreviewPage_QueryVariables = (event: PageLoadEvent) => {
  return { permalink: event.params.permalink, revisionId: event.url.searchParams.get('revisionId') ?? undefined };
};
