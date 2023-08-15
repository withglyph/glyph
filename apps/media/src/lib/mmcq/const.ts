export const SIGBITS = 5;
export const RIGHT_SHIFT = 8 - SIGBITS;
export const MULTIPLIER = 1 << RIGHT_SHIFT;
export const COLOR_SIZE = 3;
export const HISTOGRAM_SIZE = 1 << (COLOR_SIZE * SIGBITS);
export const MAX_ITERATION = 5000;
export const FRACTION_BY_POPULATIONS = 0.85;
