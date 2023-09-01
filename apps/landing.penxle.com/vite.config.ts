import { defineConfig, svg, unocss } from '@penxle/lib/vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [svg(), unocss(), sveltekit()],
  server: { port: 4020 },
});
