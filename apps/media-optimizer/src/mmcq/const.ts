export const SIGBITS = 5;
export const RSHIFT = 8 - SIGBITS;
export const MULTIPLIER = 1 << RSHIFT;
export const COLOR_SIZE = 3;
export const HISTOGRAM_SIZE = 1 << (COLOR_SIZE * SIGBITS);
export const MAX_ITERATION = 5000;
export const FRACT_BY_POPULATIONS = 0.85;
