import { defineConfig, svg } from '@penxle/lib/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import dynamicImport from 'vite-plugin-dynamic-import';

export default defineConfig({
  plugins: [dynamicImport(), svg(), sveltekit()],
  server: { port: 4030 },
});
