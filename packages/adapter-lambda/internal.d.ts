declare module 'SERVER' {
  export { Server } from '@sveltejs/kit';
}

declare module 'MANIFEST' {
  import type { SSRManifest } from '@sveltejs/kit';

  export const manifest: SSRManifest;
  export const prerendered: Set<string>;
}
