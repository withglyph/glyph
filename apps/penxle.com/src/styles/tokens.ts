import { defineTokens } from '@pandacss/dev';
import { blurs } from './blurs';
import { borderWidths } from './border-widths';
import { colors } from './colors';
import { fontSizes } from './font-sizes';
import { fontWeights } from './font-weights';
import { radii } from './radii';
import { sizes } from './sizes';
import { spacing } from './spacing';
import { zIndex } from './z-index';

export const tokens = defineTokens({
  blurs,
  borderWidths,
  colors,
  fontSizes,
  fontWeights,
  radii,
  sizes,
  spacing,
  zIndex,
});
