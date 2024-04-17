import { sveltekit } from '@sveltejs/kit/vite';
import { glitch } from '@withglyph/glitch/vite';
import { defineConfig, svg } from '@withglyph/lib/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import icons from 'unplugin-icons/vite';
import tla from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  plugins: [
    wasm(),
    tla(),
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
});
