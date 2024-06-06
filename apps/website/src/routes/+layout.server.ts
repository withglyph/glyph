import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {
  const __isWebView = event.cookies.get('glyph-wb') === 'true';

  return {
    __isWebView,
  };
}) satisfies LayoutServerLoad;
