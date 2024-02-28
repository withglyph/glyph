import { glitch } from '@penxle/glitch/vite';
import { defineConfig, svg } from '@penxle/lib/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import icons from 'unplugin-icons/vite';

export default defineConfig({
  plugins: [
    svg(),
    icons({
      compiler: 'svelte',
      customCollections: {
        effit: FileSystemIconLoader('./src/assets/icons'),
      },
    }),
    glitch(),
    sveltekit(),
  ],
  server: { port: 4000 },
});
