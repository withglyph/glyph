import { lookupCollection } from '@iconify/json';
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders';
import { presetIcons } from '@unocss/preset-icons';
import { presetUno } from '@unocss/preset-uno';
import { basicColors, designColors, partialShadedColors, shadedColors, specialColors } from './colors';
import { fontFamily } from './font-family';
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
        editor: FileSystemIconLoader('./src/assets/editor-icons'),
      },
      extraProperties: {
        'flex': 'none',
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    presetUno(),
  ],
  rules: [],
  shortcuts: [
    [/^square-(.*)$/, ([, c]) => `w-${c} h-${c}`],
    ['center', 'justify-center items-center'],
    [/^([^-]+)-(primary|secondary|tertiary|disabled|cardprimary|darkprimary)$/, ([, c, d]) => `${c}-${c}-${d}`],
    [
      /^(title|subtitle|body|bodylong|caption)-(\d+)-(eb|sb|b|m)$/,

      ([, t, d, w]) => {
        const fontWeight = {
          eb: 'extrabold',
          sb: 'semibold',
          b: 'bold',
          m: 'medium',
        }[w];

        if (t === 'bodylong') return `text-[${d}px] font-${fontWeight} leading-[${Number(d) + 10}px]`;

        return `text-[${d}px] font-${fontWeight}`;
      },
    ],
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
      xs: '400px',
      sm: '800px',
      lg: '1024px',
      xl: '1600px',
    },
    fontFamily,
  }),
});

export type { Theme } from '@unocss/preset-uno';
