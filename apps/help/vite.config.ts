import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, svg } from '@withglyph/lib/vite';
import dynamicImport from 'vite-plugin-dynamic-import';

export default defineConfig({
  plugins: [dynamicImport(), svg(), sveltekit()],
  server: { port: 4030 },
});
