import { presetPenxle } from '@penxle/unocss';
import {
  defineConfig,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss';

export default defineConfig({
  presets: [presetPenxle()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
