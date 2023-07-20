import { sentrySvelteKit as sentry } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import browserslist from 'browserslist';
import houdini from 'houdini/vite';
import { browserslistToTargets } from 'lightningcss';
import unocss from 'unocss/vite';
import { defineConfig } from 'vite';
import { svg } from './src/vite';

// eslint-disable-next-line import/no-default-export
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
  plugins: [
    sentry({
      autoInstrument: false,
      sourceMapsUploadOptions: { telemetry: false },
    }),
    svg(),
    unocss(),
    houdini(),
    sveltekit(),
  ],
  server: {
    host: '127.0.0.1',
    port: 4000,
    strictPort: true,
  },
});
