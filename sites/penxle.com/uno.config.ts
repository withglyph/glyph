import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders';
import {
  defineConfig,
  presetIcons,
  presetTypography,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss';
import type { Theme } from '@unocss/preset-uno';

// eslint-disable-next-line import/no-default-export
export default defineConfig<Theme>({
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
  extendTheme: (theme) => ({
    ...theme,
    colors: {
      inherit: 'inherit',
      current: 'currentColor',
      transparent: 'transparent',
      black: '#000000',
      white: '#FFFFFF',
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
      red: {
        50: '#FEF2F2',
        100: '#FEE2E2',
        200: '#FECACA',
        300: '#FCA5A5',
        400: '#F87171',
        500: '#EF4444',
        600: '#DC2626',
        700: '#B91C1C',
        800: '#991B1B',
        900: '#7F1D1D',
        950: '#450A0A',
      },
      green: {
        50: '#F0FDF4',
        100: '#DCFCE7',
        200: '#BBF7D0',
        300: '#86EFAC',
        400: '#4ADE80',
        500: '#22C55E',
        600: '#16A34A',
        700: '#15803D',
        800: '#166534',
        900: '#14532D',
        950: '#052E16',
      },
      brand: {
        50: '#FFF9F8',
        100: '#FEF3F1',
        200: '#FDDFDE',
        300: '#FCC8C6',
        400: '#F98B88',
        500: '#E95554',
        600: '#A83E3D',
        700: '#83302E',
        800: '#4F1C1C',
        900: '#361312',
        950: '#170807',
      },
    },
    fontSize: {
      ...theme.fontSize,
      '2xs': ['0.625rem', '0.75rem'],
    },
  }),
});
