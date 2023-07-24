import { z } from 'zod';
import { UNAVAILABLE_SPACE_SLUGS } from '$lib/const';

const SpaceSlugSchema = z
  .string()
  .min(2, '스페이스 URL은 2글자 이상이어야 해요')
  .max(20, '스페이스 URL은 20자를 넘을 수 없어요')
  .regex(/^[\d._a-z]+$/, '영문 소문자, 숫자, ., _만 사용할 수 있어요')
  .refine((v) => !v.includes('..'), '.은 연속으로 사용할 수 없어요')
  .refine(
    (v) => !v.startsWith('.') && !v.endsWith('.'),
    '.로 시작하거나 끝날 수 없어요',
  )
  .refine(
    (v) =>
      !UNAVAILABLE_SPACE_SLUGS.EXACT.includes(v) &&
      !UNAVAILABLE_SPACE_SLUGS.CONTAIN.some((s) => v.includes(s)),
    '사용할 수 없는 URL이에요',
  );

export const CreateSpaceInputSchema = z.object({
  name: z
    .string()
    .min(1, '스페이스 이름을 입력해주세요')
    .max(20, '스페이스 이름은 20자를 넘을 수 없어요'),
  slug: SpaceSlugSchema,
});
