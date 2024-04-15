import type { LayoutLoadEvent } from './$types';

export const _TagLayout_QueryVariables = (event: LayoutLoadEvent) => {
  return { name: event.params.name };
};
