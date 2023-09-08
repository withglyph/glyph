import { glitch } from '@penxle/glitch/vite';
import { defineConfig, svg, unocss } from '@penxle/lib/vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [svg(), unocss(), glitch(), sveltekit()],
  server: { port: 4000 },
});
