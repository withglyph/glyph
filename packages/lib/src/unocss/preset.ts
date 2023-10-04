import { lookupCollection } from '@iconify/json';
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders';
import { presetIcons } from '@unocss/preset-icons';
import { presetUno } from '@unocss/preset-uno';
import { basicColors, designColors, partialShadedColors, shadedColors, specialColors } from './colors';
import type { Preset } from '@unocss/core';
import type { Theme } from '@unocss/preset-uno';

export const presetPenxle = (): Preset<Theme> => ({
  name: '@penxle/lib/unocss:preset-penxle',
  presets: [
    presetIcons({
      collections: {
        lc: async () => lookupCollection('lucide'),
        lg: async () => lookupCollection('simple-icons'),
        px: FileSystemIconLoader('./src/assets/icons', (s) => s.replace(/^<svg /, '<svg fill="currentColor" ')),
      },
      extraProperties: {
        'flex': 'none',
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    presetUno(),
  ],
  rules: [
    [
      'font-sans',
      {
        'font-family': 'SUIT, Pretendard',
        'font-feature-settings': '"ss18"',
      },
    ],
    ['font-mono', { 'font-family': 'FiraCode' }],
    [
      'font-content-sans',
      {
        'font-family': 'Pretendard',
        // spell-checker:disable-next-line
        'font-feature-settings': '"case", "ss06", "calt" 0',
      },
    ],
    ['font-content-serif', { 'font-family': 'RIDIBatang' }],
  ],
  shortcuts: [
    [/^square-(.*)$/, ([, c]) => `w-${c} h-${c}`],
    ['center', 'justify-center items-center'],
    [/^([^-]+)-(primary|secondary|tertiary|disabled|cardprimary)$/, ([, c, d]) => `${c}-${c}-${d}`],
  ],
  extendTheme: (theme) => ({
    ...theme,
    colors: {
      ...specialColors,
      ...basicColors,
      ...shadedColors,
      ...partialShadedColors,
      ...designColors,
    },
    breakpoints: {
      sm: '800px',
      lg: '1024px',
      xl: '1600px',
    },
  }),
});

export type { Theme } from '@unocss/preset-uno';
