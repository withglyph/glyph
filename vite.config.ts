import { sveltekit } from '@sveltejs/kit/vite';
import houdini from 'houdini/vite';
import unocss from 'unocss/vite';
import { defineConfig } from 'vite';
import { svg } from './src/vite';

export default defineConfig({
  server: { host: '127.0.0.1', port: 4000, strictPort: true },
  plugins: [unocss({ mode: 'global' }), houdini(), svg(), sveltekit()],
  preview: { host: '127.0.0.1', port: 5000, strictPort: true },
});
