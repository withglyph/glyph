export const hash = (x: string) => {
  let h = 5381;
  for (let i = 0; i < x.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    h = (h << 5) + h + x.codePointAt(i)!;
  }
  return h;
};
