import * as R from 'radash';

const first = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];
const second = [
  'ㅏ',
  'ㅐ',
  'ㅑ',
  'ㅒ',
  'ㅓ',
  'ㅔ',
  'ㅕ',
  'ㅖ',
  'ㅗ',
  'ㅘ',
  'ㅙ',
  'ㅚ',
  'ㅛ',
  'ㅜ',
  'ㅝ',
  'ㅞ',
  'ㅟ',
  'ㅠ',
  'ㅡ',
  'ㅢ',
  'ㅣ',
];
const third = [
  '',
  'ㄱ',
  'ㄲ',
  'ㄱㅅ',
  'ㄴ',
  'ㄴㅈ',
  'ㄴㅎ',
  'ㄷ',
  'ㄹ',
  'ㄹㄱ',
  'ㄹㅁ',
  'ㄹㅂ',
  'ㄹㅅ',
  'ㄹㅌ',
  'ㄹㅍ',
  'ㄹㅎ',
  'ㅁ',
  'ㅂ',
  'ㅂㅅ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];

export const disassembleHangulString = (str: string) => {
  return R.flat(
    [...str].map((char) => {
      const code = char.codePointAt(0);
      if (!code || code < 44_032 || code > 55_203) {
        return [char];
      }

      const firstIndex = Math.floor((code - 44_032) / 588);
      const secondIndex = Math.floor(((code - 44_032) % 588) / 28);
      const thirdIndex = Math.floor(((code - 44_032) % 588) % 28);

      return [first[firstIndex], second[secondIndex], third[thirdIndex]];
    }),
  ).join('');
};

export const InitialHangulString = (str: string) => {
  return [...str]
    .map((char) => {
      const code = char.codePointAt(0);
      if (!code || code < 44_032 || code > 55_203) {
        return '';
      }

      const firstIndex = Math.floor((code - 44_032) / 588);

      return first[firstIndex];
    })
    .join('');
};
