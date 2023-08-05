import { presetPenxle } from '@penxle/unocss';
import {
  defineConfig,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss';
import type { Theme } from '@penxle/unocss';

export default defineConfig<Theme>({
  presets: [presetPenxle()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
