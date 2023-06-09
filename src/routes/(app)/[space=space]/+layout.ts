import { graphql } from '$houdini';
import type { SpaceLayout_QueryVariables } from './$houdini';

export const _houdini_load = graphql(`
  query SpaceLayout_Query($slug: String!) {
    space(slug: $slug) {
      __typename
    }
  }
`);

export const _SpaceLayout_QueryVariables: SpaceLayout_QueryVariables = (
  event
) => {
  return {
    slug: event.params.space,
  };
};
