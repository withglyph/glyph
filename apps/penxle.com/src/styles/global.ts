import { defineGlobalStyles } from '@pandacss/dev';

export const globalCss = defineGlobalStyles({
  ':root': {
    '--global-color-border': 'colors.gray.200',
    '--global-color-placeholder': 'colors.gray.400',
    '--global-font-body': 'fonts.sans',

    'color': 'gray.950',
    'lineHeight': 1.5,

    // spell-checker:disable-next-line
    'fontFeatureSettings': '"calt" 0, "ss01" 1, "ss05" 1, "ss07" 1',

    'WebkitFontSmoothing': 'auto',
    'MozOsxFontSmoothing': 'auto',
  },

  '*, *::before, *::after': {
    borderWidth: 0,
    borderStyle: 'solid',
    outlineWidth: 0,
    outlineStyle: 'solid',
    backgroundColor: 'transparent',
  },

  'button': {
    cursor: 'pointer',
  },

  '[disabled]': {
    cursor: 'default',
  },

  ':focus-visible': {
    outline: 'none',
  },
});
