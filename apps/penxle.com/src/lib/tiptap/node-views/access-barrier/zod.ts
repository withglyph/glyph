import { ZodIssueCode } from 'zod';
import type { z } from 'zod';

export const priceErrorMap: z.ZodErrorMap = (error, ctx) => {
  switch (error.code) {
    case ZodIssueCode.too_small:
      return { message: `100P 이상의 값으로 설정해야 해요` };
    case ZodIssueCode.too_big:
      return { message: `1,000,000P 이하의 값으로 설정해야 해요` };
    case ZodIssueCode.not_multiple_of:
      return { message: `100P 단위로 설정해 주세요` };
    case ZodIssueCode.invalid_type:
      return { message: '가격을 입력해 주세요' };
    default:
      return { message: ctx.defaultError };
  }
};
