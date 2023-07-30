import { sveltekit } from '@sveltejs/kit/vite';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';
import unocss from 'unocss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    cssMinify: 'lightningcss',
  },
  css: {
    devSourcemap: true,
    transformer: 'lightningcss',
    lightningcss: {
      drafts: { nesting: true },
      targets: browserslistToTargets(
        browserslist('> 0.25%, last 2 versions, not dead'),
      ),
    },
  },
  plugins: [unocss(), sveltekit()],
  server: {
    host: '127.0.0.1',
    port: 4999,
    strictPort: true,
  },
});
