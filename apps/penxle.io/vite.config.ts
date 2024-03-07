import { defineConfig, svg } from '@penxle/lib/vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [svg(), sveltekit()],
  server: { port: 4010 },
});
