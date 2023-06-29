import type { ProfilePage_QueryVariables } from './$houdini';

export const _ProfilePage_QueryVariables = (({ params }) => ({
  handle: params.profile,
})) satisfies ProfilePage_QueryVariables;
