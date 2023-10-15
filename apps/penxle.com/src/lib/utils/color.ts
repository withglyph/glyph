export const getColorLuminosity = (hex: string) => {
  const normalize = (v: string) => {
    const val = Number.parseInt(v, 16) / 255;
    return val <= 0.039_28 ? val / 12.92 : ((val + 0.055) / 1.055) ** 2.4;
  };

  const red = normalize(hex.slice(1, 3));
  const green = normalize(hex.slice(3, 5));
  const blue = normalize(hex.slice(5, 7));

  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

  return luminance > 0.179 ? 'light' : 'dark';
};
