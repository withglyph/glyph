import type { SpacePage_QueryVariables } from './$houdini';

export const trailingSlash = 'always';

export const _SpacePage_QueryVariables = (({ params }) => ({
  slug: params.space,
})) satisfies SpacePage_QueryVariables;
