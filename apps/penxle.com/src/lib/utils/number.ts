const nf = new Intl.NumberFormat('en-US');

export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const comma = (value: number) => {
  return nf.format(value);
};
