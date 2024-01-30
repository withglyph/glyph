import { presetPenxle } from '@penxle/lib/unocss';
import { defineConfig, transformerDirectives, transformerVariantGroup } from 'unocss';

export default defineConfig({
  content: { pipeline: { include: ['**/*.{svelte,ts}'] } },
  presets: [presetPenxle()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
