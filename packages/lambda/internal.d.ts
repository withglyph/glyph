declare module '0SERVER' {
  export { Server } from '@sveltejs/kit';
}

declare module '0MANIFEST' {
  import type { SSRManifest } from '@sveltejs/kit';

  export const manifest: SSRManifest;
  export const prerendered: Set<string>;
}
