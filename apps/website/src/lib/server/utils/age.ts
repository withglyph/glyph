import dayjs from 'dayjs';
import { and, desc, gt, inArray } from 'drizzle-orm';
import * as R from 'radash';
import * as E from '$lib/enums';
import { database, UserPersonalIdentities } from '../database';
import type { Context } from '../context';

const getKoreanAge = (birthday?: dayjs.Dayjs) => {
  if (!birthday) {
    return 0;
  }

  const birthYear = birthday.kst().year();
  const currentYear = dayjs.kst().year();

  const koreanAge = currentYear - birthYear + 1;

  return koreanAge;
};

const getBirthdayAge = (birthday?: dayjs.Dayjs) => {
  if (!birthday) {
    return 0;
  }

  const currentDate = dayjs();
  const birthYear = birthday.year();
  const currentYear = currentDate.year();
  const age = currentYear - birthYear;

  const hasBirthdayPassed = currentDate.isAfter(birthday.startOf('year').add(age, 'year'));

  if (!hasBirthdayPassed) {
    return age - 1;
  }

  return age;
};

type AgeIdentity = Pick<typeof UserPersonalIdentities.$inferSelect, 'kind' | 'birthday'>;

const allowedAgeRating = (identity: AgeIdentity | undefined): (keyof typeof E.PostAgeRating)[] => {
  if (!identity) {
    return ['ALL'];
  }

  if (identity.kind === 'FOREIGN_PASSPORT') {
    return R.sift([
      'ALL',
      getBirthdayAge(identity.birthday) >= 18 && 'R19',
      getBirthdayAge(identity.birthday) >= 14 && 'R15',
    ]);
  } else {
    return R.sift([
      'ALL',
      getKoreanAge(identity.birthday) >= 20 && 'R19',
      getKoreanAge(identity.birthday) >= 15 && 'R15',
    ]);
  }
};

export const getPersonalIdentity = async (userId: string | undefined, context: Pick<Context, 'loader'>) => {
  const loader = context.loader({
    name: 'UserPersonalIdentities(userId)',
    nullable: true,
    load: async (userIds: string[]) => {
      return database
        .selectDistinctOn([UserPersonalIdentities.userId])
        .from(UserPersonalIdentities)
        .where(and(inArray(UserPersonalIdentities.userId, userIds), gt(UserPersonalIdentities.expiresAt, dayjs())))
        .orderBy(UserPersonalIdentities.userId, desc(UserPersonalIdentities.createdAt));
    },

    key: (identity) => identity?.userId,
  });

  return userId ? loader.load(userId) : null;
};

export const getAllowedAgeRating = async (userId: string | undefined, context: Pick<Context, 'loader'>) => {
  const identity = await getPersonalIdentity(userId, context);
  return allowedAgeRating(identity ?? undefined);
};

export const checkAgeRatingAllowed = async (
  userId: string | undefined,
  rating: keyof typeof E.PostAgeRating,
  context: Pick<Context, 'loader'>,
) => {
  if (rating === 'ALL') {
    return true;
  }

  const allowed = await getAllowedAgeRating(userId, context);
  return allowed.includes(rating);
};
