import { defineTokens } from '@pandacss/dev';
import { aspectRatios } from './aspect-ratios';
import { blurs } from './blurs';
import { borderWidths } from './border-widths';
import { colors } from './colors';
import { fontSizes } from './font-sizes';
import { fontWeights } from './font-weights';
import { fonts } from './fonts';
import { lineHeights } from './line-heights';
import { opacity } from './opacity';
import { radii } from './radii';
import { sizes } from './sizes';
import { spacing } from './spacing';
import { zIndex } from './z-index';

export const tokens = defineTokens({
  aspectRatios,
  blurs,
  borderWidths,
  colors,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  opacity,
  radii,
  sizes,
  spacing,
  zIndex,
});
