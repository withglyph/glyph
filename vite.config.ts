import { sveltekit } from '@sveltejs/kit/vite';
import houdini from 'houdini/vite';
import unocss from 'unocss/vite';
import { defineConfig } from 'vite';
import { svg } from './src/vite';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  server: { host: '127.0.0.1', port: 4000, strictPort: true },
  plugins: [svg(), houdini(), unocss(), sveltekit()],
  preview: { host: '127.0.0.1', port: 5000, strictPort: true },
});
