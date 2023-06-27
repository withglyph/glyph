import { sentrySvelteKit as sentry } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import houdini from 'houdini/vite';
import unocss from 'unocss/vite';
import { defineConfig } from 'vite';
import { svg } from './src/vite';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  server: { host: '127.0.0.1', port: 4000, strictPort: true },
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
  preview: { host: '127.0.0.1', port: 4001, strictPort: true },
});
