export const fontFamily = {
  sans: 'Pretendard',
  serif: 'RIDIBatang',
  mono: 'FiraCode',
} as const;

export type FontFamily = keyof typeof fontFamily;
