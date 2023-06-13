import { PermissionDeniedError } from '$lib/errors';
import type {
  AfterLoadEvent,
  SpaceDashboardLayout_QueryVariables,
} from './$houdini';

export const _SpaceDashboardLayout_QueryVariables = (({ params }) => ({
  slug: params.space,
})) satisfies SpaceDashboardLayout_QueryVariables;

export const _houdini_afterLoad = ({
  data: {
    SpaceDashboardLayout_Query: { space },
  },
}: AfterLoadEvent) => {
  if (!space.meAsMember?.canAccessDashboard) {
    throw new PermissionDeniedError();
  }
};
