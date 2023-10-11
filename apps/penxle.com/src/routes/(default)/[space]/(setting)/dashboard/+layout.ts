import type { LayoutLoadEvent } from './$types';

export const _SpaceDashboardLayout_QueryVariables = (event: LayoutLoadEvent) => {
  return { slug: event.params.space };
};

// export const _houdini_afterLoad = ({
//   data: {
//     SpaceDashboardLayout_Query: { space },
//   },
// }: AfterLoadEvent) => {
//   if (!space.meAsMember) {
//     throw new PermissionDeniedError();
//   }
// };
