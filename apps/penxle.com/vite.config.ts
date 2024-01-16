import { glitch } from '@penxle/glitch/vite';
import { defineConfig, svg, unocss } from '@penxle/lib/vite';
import { sentrySvelteKit as sentry } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [svg(), unocss(), glitch(), sentry(), sveltekit()],
  server: { port: 4000 },
});
