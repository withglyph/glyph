import type { SpacePage_QueryVariables } from './$houdini';

export const trailingSlash = 'always';

export const _SpacePage_QueryVariables: SpacePage_QueryVariables = (event) => {
  return {
    slug: event.params.space,
  };
};
