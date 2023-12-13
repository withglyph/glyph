export const fontFamily = {
  sans: 'PNXL_Pretendard',
  serif: 'PNXL_RIDIBatang',
  serif2: 'PNXL_KoPubWorldBatang',
  serif3: 'PNXL_NanumMyeongjo',
  mono: 'PNXL_FiraCode',
} as const;

export type FontFamily = keyof typeof fontFamily;
