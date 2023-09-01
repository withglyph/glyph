import { defineConfig, svg, unocss } from '@penxle/lib/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import houdini from 'houdini/vite';

export default defineConfig({
  plugins: [svg(), unocss(), houdini(), sveltekit()],
  server: { port: 4000 },
});
