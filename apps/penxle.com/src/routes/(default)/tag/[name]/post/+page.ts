import type { PageLoadEvent } from './$types';

export const _TagPostPage_QueryVariables = (event: PageLoadEvent) => {
  return { name: event.params.name };
};
