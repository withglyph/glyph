import type { LayoutLoad } from './$types';

export const load = (async (event) => {
  return {
    __isWebView: event.data.__isWebView,
  };
}) satisfies LayoutLoad;
