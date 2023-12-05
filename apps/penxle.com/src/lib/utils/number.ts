const nf = new Intl.NumberFormat('en-US');
const base36Characters = '0123456789abcdefghijklmnopqrstuvwxyz';

export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const comma = (value: number) => {
  return nf.format(value);
};

export const humanizeNumber = (value: number) => {
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: '천' },
    { value: 1e4, symbol: '만' },
    { value: 1e8, symbol: '억' },
  ];

  const rx = /\.0+$|(\.\d*[1-9])0+$/;
  const item = [...lookup].reverse().find(function (item) {
    return value >= item.value;
  });

  return item ? (value / item.value).toFixed(1).replace(rx, '$1') + item.symbol : '0';
};

export const calcurateReadingTime = (characterCount: number) => {
  return comma(Math.ceil(characterCount / 700));
};

export const base36To10 = (value: string) => {
  let result = 0n;
  for (const digit of value) {
    result = result * 36n + BigInt(base36Characters.indexOf(digit));
  }

  return result.toString();
};
