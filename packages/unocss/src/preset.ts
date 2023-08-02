import { lookupCollection } from '@iconify/json';
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders';
import { definePreset, presetIcons, presetTypography, presetUno } from 'unocss';
import { basicColors, shadedColors, specialColors } from './colors';
import type { Theme } from '@unocss/preset-uno';

export const presetPenxle = () =>
  definePreset<Theme>({
    name: '@penxle/unocss:preset-penxle',
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
    rules: [
      [
        'font-sans',
        {
          'font-family': 'SUIT, Pretendard',
          'font-feature-settings': '"ss18"',
        },
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
        ...specialColors,
        ...basicColors,
        ...shadedColors,
      },
    }),
  });

export type { Theme } from '@unocss/preset-uno';
