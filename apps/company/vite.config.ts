import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, svg } from '@withglyph/lib/vite';

export default defineConfig({
  plugins: [svg(), sveltekit()],
  server: { port: 4010 },
});
