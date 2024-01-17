import stringHash from '@sindresorhus/string-hash';

const randomNamePrefixes = [
  '춤추는',
  '움직이는',
  '빛나는',
  '반짝이는',
  '밥먹는',
  '양치하는',
  '물마시는',
  '잠자는',
  '뛰는',
  '놀고있는',
  '놀란',
  '노래하는',
  '생각하는',
  '연성하는',
  '코딩하는',
  '덕질하는',
  '그림그리는',
  '책읽는',
  '펜슬하는',
];

const randomNameSuffixes = [
  '강아지',
  '고양이',
  '토끼',
  '사자',
  '호랑이',
  '코끼리',
  '돼지',
  '쥐',
  '뱀',
  '악어',
  '고릴라',
  '원숭이',
  '고슴도치',
  '물고기',
  '거북이',
  '개구리',
  '양',
  '말',
  '닭',
  '오리',
  '참새',
  '독수리',
  '물개',
  '고래',
  '상어',
  '바다거북',
  '불가사리',
  '해파리',
  '낙지',
  '문어',
  '오징어',
  '새우',
  '펜슬몬',
  '붕어빵',
  '마요네즈',
];

const randomNameAmount = randomNamePrefixes.length * randomNameSuffixes.length;

export const generateRandomName = (seed: string) => {
  const random = stringHash(seed) % randomNameAmount;
  const prefix = randomNamePrefixes[random % randomNamePrefixes.length];
  const suffix = randomNameSuffixes[Math.floor(random / randomNamePrefixes.length)];

  return `${prefix} ${suffix}`;
};
