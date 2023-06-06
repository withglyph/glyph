import { z } from 'zod';
import { BLACKLIST_SPACE_SLUGS } from '$lib/const';

export const SpaceSlugSchema = z
  .string()
  .min(2, '스페이스 URL은 2글자 이상이어야 해요')
  .max(20, '스페이스 URL은 20자를 넘을 수 없어요')
  .regex(/^[\d._a-z]+$/, '영문 소문자, 숫자, ., _만 사용할 수 있어요')
  .refine((v) => !v.includes('..'), '.은 연속으로 사용할 수 없어요')
  .refine(
    (v) => !v.startsWith('.') && !v.endsWith('.'),
    '.로 시작하거나 끝날 수 없어요'
  )
  .refine(
    (v) => !BLACKLIST_SPACE_SLUGS.includes(v),
    '사용할 수 없는 URL이에요'
  );
