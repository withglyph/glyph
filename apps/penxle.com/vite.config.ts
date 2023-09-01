import { svg, unocss } from '@penxle/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import browserslist from 'browserslist';
import houdini from 'houdini/vite';
import { browserslistToTargets } from 'lightningcss';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    cssMinify: 'lightningcss',
  },
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      drafts: { nesting: true },
      targets: browserslistToTargets(
        browserslist('> 0.25%, last 2 versions, not dead'),
      ),
    },
  },
  ssr: { noExternal: ['@penxle/lib'] },
  plugins: [svg(), unocss(), houdini(), sveltekit()],
  server: {
    host: '127.0.0.1',
    port: 4000,
    strictPort: true,
  },
});
