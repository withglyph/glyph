import type { SpaceNewPostPage_QueryVariables } from './$houdini';

export const _SpaceNewPostPage_QueryVariables: SpaceNewPostPage_QueryVariables =
  (event) => {
    return {
      slug: event.params.space,
    };
  };
