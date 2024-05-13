import { defineTokens } from '@pandacss/dev';

export const colors = defineTokens.colors({
  current: { value: 'currentColor' },

  transparent: { value: 'rgb(0 0 0 / 0)' },

  gray: {
    0: { value: '#FFFFFF' },
    50: { value: '#F5F5F5' },
    100: { value: '#EEEEEE' },
    150: { value: '#E9E9E9' },
    200: { value: '#E2E2E2' },
    300: { value: '#C7C7C7' },
    400: { value: '#9B9B9B' },
    500: { value: '#767676' },
    600: { value: '#595959' },
    800: { value: '#353535' },
    900: { value: '#171717' },
  },

  brand: {
    50: { value: '#F9F7FF' },
    200: { value: '#E4DDF9' },
    400: { value: '#8162E8' },
    600: { value: '#49348D' },
  },

  red: {
    50: { value: '#FFF8F8' },
    200: { value: '#FFE5E5' },
    400: { value: '#E36469' },
    600: { value: '#DC3D43' },
    800: { value: '#CD2B31' },
    900: { value: '#7B1A1D' },
  },

  yellow: {
    800: { value: '#FFAA00' },
  },

  green: {
    800: { value: '#04B014' },
  },
});
