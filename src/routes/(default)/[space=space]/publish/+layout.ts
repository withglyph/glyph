import { graphql } from '$houdini';
import { PermissionDeniedError } from '$lib/errors';
import type {
  AfterLoadEvent,
  SpacePublishLayout_QueryVariables,
} from './$houdini';

export const _houdini_load = graphql(`
  query SpacePublishLayout_Query($slug: String!) @load {
    space(slug: $slug) {
      meAsMember {
        canPublish
      }
    }
  }
`);

export const _SpacePublishLayout_QueryVariables = (({ params }) => ({
  slug: params.space,
})) satisfies SpacePublishLayout_QueryVariables;

export const _houdini_afterLoad = ({
  data: {
    SpacePublishLayout_Query: { space },
  },
}: AfterLoadEvent) => {
  if (!space.meAsMember?.canPublish) {
    throw new PermissionDeniedError();
  }
};
