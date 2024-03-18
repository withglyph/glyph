import { defineGlobalStyles } from '@pandacss/dev';

export const globalCss = defineGlobalStyles({
  '*': {
    margin: '0',
    padding: '0',
    font: 'inherit',
    color: 'inherit',
    backgroundColor: 'transparent',
  },

  '*, *::before, *::after': {
    boxSizing: 'border-box',
    border: '0 solid {colors.gray.200}',
    outline: '0 solid {colors.gray.200}',
  },

  'html': {
    fontFamily: 'sans',
    // spell-checker:disable-next-line
    fontFeatureSettings: '"calt" 0, "ss01" 1, "ss05" 1, "ss07" 1',
    textSizeAdjust: '100%',

    WebkitFontSmoothing: 'auto',
    MozOsxFontSmoothing: 'auto',

    color: 'gray.950',
    lineHeight: '1.5',
  },

  'a': {
    textDecoration: 'inherit',
  },

  'button': {
    cursor: 'pointer',
  },

  'hr': {
    borderTopWidth: '1px',
    height: '0',
  },

  'img, video': {
    display: 'block',
    maxWidth: 'full',
    height: 'auto',
  },

  'ol, ul': {
    listStyle: 'none',
  },

  ':disabled': {
    cursor: 'default',
  },

  ':focus-visible': {
    outline: 'none',
  },

  '::placeholder': {
    color: 'gray.400',
  },
});
