import { lookupCollection } from '@iconify/json';
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
        lc: async () => lookupCollection('lucide'),
        lg: async () => lookupCollection('simple-icons'),
        px: FileSystemIconLoader('./src/assets/icons', (s) =>
          s.replace(/^<svg /, '<svg fill="currentColor" '),
        ),
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
        5: '#FAFAF9',
        10: '#F4F4F3',
        20: '#E7E5E4',
        30: '#D6D3D1',
        40: '#A8A29E',
        50: '#78716C',
        60: '#57534E',
        70: '#44403C',
        80: '#292524',
        90: '#1C1917',
        100: '#0C0A09',
      },
      red: {
        5: '#FEF2F2',
        10: '#FEE2E2',
        20: '#FECACA',
        30: '#FCA5A5',
        40: '#F87171',
        50: '#EF4444',
        60: '#DC2626',
        70: '#B91C1C',
        80: '#991B1B',
        90: '#7F1D1D',
        100: '#450A0A',
      },
      green: {
        5: '#F0FDF4',
        10: '#DCFCE7',
        20: '#BBF7D0',
        30: '#86EFAC',
        40: '#4ADE80',
        50: '#22C55E',
        60: '#16A34A',
        70: '#15803D',
        80: '#166534',
        90: '#14532D',
        100: '#052E16',
      },
      brand: {
        5: '#FFF9F8',
        10: '#FEF1F0',
        20: '#FDDFDE',
        30: '#FCC8C6',
        40: '#F98B88',
        50: '#F66062',
        60: '#A83E3D',
        70: '#83302E',
        80: '#4F1C1C',
        90: '#361312',
        100: '#170807',
      },
    },
  }),
});
