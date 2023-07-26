import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders';
import {
  defineConfig,
  presetIcons,
  presetTypography,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  presets: [
    presetIcons({
      collections: {
        px: FileSystemIconLoader('./src/assets/icons', (s) =>
          s.replace(/^<svg /, '<svg fill="currentColor" '),
        ),
        lc: async () => import('@iconify-json/lucide/icons.json'),
        lg: async () => import('@iconify-json/simple-icons/icons.json'),
      },
      extraProperties: {
        'flex': 'none',
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    presetUno(),
    presetTypography(),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  rules: [
    [
      'font-sans',
      { 'font-family': 'SUIT, Pretendard', 'font-feature-settings': '"ss18"' },
    ],
    ['font-mono', { 'font-family': 'FiraCode' }],

    [
      'font-content-sans',
      {
        'font-family': 'Pretendard',
        'font-feature-settings': '"case", "ss06", "calt" 0',
      },
    ],
    ['font-content-serif', { 'font-family': 'RIDIBatang' }],
  ],
  shortcuts: [
    [/^square-(.*)$/, ([, c]) => `w-${c} h-${c}`],
    ['center', 'justify-center items-center'],
  ],
  theme: {
    colors: {
      // https://github.com/unocss/unocss/blob/main/packages/preset-mini/src/_theme/colors.ts
      // neutral로 gray 덮어씀
      gray: {
        50: '#FAFAF9',
        100: '#F5F5F4',
        200: '#E7E5E4',
        300: '#D6D3D1',
        400: '#A8A29E',
        500: '#78716C',
        600: '#57534E',
        700: '#44403C',
        800: '#292524',
        900: '#1C1917',
        950: '#0C0A09',
      },
      brand: {
        50: '#F0F7FE',
        100: '#DDECFC',
        200: '#C3DFFA',
        300: '#9ACBF6',
        400: '#6AAFF0',
        500: '#468FEA',
        600: '#3273DE',
        700: '#295FCC',
        800: '#274DA6',
        900: '#254383',
        950: '#1B2A50',
      },
    },
    fontSize: {
      '2xs': ['0.625rem', '0.75rem'],
    },
  },
});
