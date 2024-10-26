import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {
  const __isWebView = !!event.cookies.get('glyph-wb');

  return {
    __isWebView,
  };
}) satisfies LayoutServerLoad;
