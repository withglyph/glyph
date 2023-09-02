import { SIGBITS } from './const';

export type ColorChannel = 'r' | 'g' | 'b';

export type Color = Record<ColorChannel, number>;
export const getColorIndex = ({ r, g, b }: Color) => {
  return (r << (2 * SIGBITS)) + (g << SIGBITS) + b;
};
