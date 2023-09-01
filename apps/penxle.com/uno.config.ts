import { presetPenxle } from '@penxle/lib/unocss';
import {
  defineConfig,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss';

export default defineConfig({
  presets: [presetPenxle()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
