import dayjs from 'dayjs';

export const getKoreanAge = (birthday?: Date) => {
  if (!birthday) {
    return 0;
  }

  const birthYear = dayjs(birthday).kst().year();
  const currentYear = dayjs.kst().year();

  const koreanAge = currentYear - birthYear + 1;

  return koreanAge;
};

export const isAdulthood = (birthday?: Date) => {
  return getKoreanAge(birthday) >= 20;
};

export const isGte15 = (birthday?: Date) => {
  return getKoreanAge(birthday) >= 15;
};
