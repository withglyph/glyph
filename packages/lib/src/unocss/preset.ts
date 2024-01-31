import { lookupCollection } from '@iconify/json';
import { IconSet } from '@iconify/tools';
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
        tb: async () => {
          const collection = await lookupCollection('tabler');
          const iconSet = new IconSet(collection);

          iconSet.forEachSync((icon) => {
            const svg = iconSet.toSVG(icon);
            if (svg) {
              const newBody = svg.toString().replaceAll('stroke-width="2"', 'stroke-width="1.5"');
              svg.load(newBody);
              iconSet.fromSVG(icon, svg);
            }
          });

          return iconSet.export();
        },
        lc: async () => lookupCollection('lucide'),
        lg: async () => lookupCollection('simple-icons'),
        px: FileSystemIconLoader('./src/assets/icons', (s) => s.replace(/^<svg /, '<svg fill="currentColor" ')),
        px2: FileSystemIconLoader('./src/assets/icons2'),
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
    [
      /^(text)-(\d+)-(b|sb|m|r)$/,
      // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
      ([, , d, w]) => {
        const fontWeight = {
          sb: 'semibold',
          b: 'bold',
          m: 'medium',
          r: 'normal',
        }[w];

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
