import { sveltekit } from '@sveltejs/kit/vite';
import { glitch } from '@withglyph/glitch/vite';
import { defineConfig, svg } from '@withglyph/lib/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import icons from 'unplugin-icons/vite';

export default defineConfig({
  plugins: [
    svg(),
    icons({
      scale: 1,
      compiler: 'svelte',
      customCollections: {
        glyph: FileSystemIconLoader('./src/assets/icons'),
      },
    }),
    glitch(),
    sveltekit(),
  ],
  server: { port: 4000 },
  optimizeDeps: {
    exclude: ['@resvg/resvg-js'],
  },
});
