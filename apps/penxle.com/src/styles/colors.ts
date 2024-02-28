import { defineTokens } from '@pandacss/dev';

export const colors = defineTokens.colors({
  current: { value: 'currentColor' },

  black: { value: '#000000' },
  white: { value: '#FFFFFF' },
  transparent: { value: 'rgb(0 0 0 / 0)' },

  gray: {
    50: { value: '#FAFAFA' },
    100: { value: '#F4F4F5' },
    150: { value: '#EBEBEB' },
    200: { value: '#E4E4E7' },
    300: { value: '#D4D4D8' },
    400: { value: '#A1A1AA' },
    500: { value: '#71717A' },
    600: { value: '#52525B' },
    700: { value: '#3F3F46' },
    800: { value: '#27272A' },
    900: { value: '#18181B' },
    950: { value: '#09090B' },
  },

  teal: {
    50: { value: '#F0FDFA' },
    100: { value: '#CCFBF1' },
    200: { value: '#99F6E4' },
    300: { value: '#5EEAD4' },
    400: { value: '#2DD4BF' },
    500: { value: '#14B8A6' },
    600: { value: '#0D9488' },
    700: { value: '#0F766E' },
    800: { value: '#115E59' },
    900: { value: '#134E4A' },
    950: { value: '#042F2E' },
  },

  red: {
    50: { value: '#FFF9F8' },
    100: { value: '#FEEEED' },
    200: { value: '#FDDFDE' },
    300: { value: '#FCC8C6' },
    400: { value: '#F98B88' },
    500: { value: '#F66062' },
    600: { value: '#A83E3D' },
    700: { value: '#83302E' },
    800: { value: '#4F1C1C' },
    900: { value: '#361312' },
    950: { value: '#170807' },
  },
});
