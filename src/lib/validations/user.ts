import { z } from 'zod';

const ProfileHandleSchema = z
  .string()
  .min(2, '프로필 URL은 2글자 이상이어야 해요')
  .max(20, '프로필 URL은 20자를 넘을 수 없어요')
  .regex(/^[\d._a-z]+$/, '영문 소문자, 숫자, ., _만 사용할 수 있어요')
  .refine((v) => !v.includes('..'), '.은 연속으로 사용할 수 없어요')
  .refine(
    (v) => !v.startsWith('.') && !v.endsWith('.'),
    '.로 시작하거나 끝날 수 없어요',
  );

export const LoginInputSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .max(255, '이메일은 255자를 넘을 수 없어요')
    .email('잘못된 이메일 형식이에요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export const SignupInputSchema = LoginInputSchema.extend({
  name: z
    .string()
    .min(1, '닉네임을 입력해주세요')
    .max(20, '닉네임은 20자를 넘을 수 없어요'),
  isAgreed: z.boolean().refine((v) => v, '약관에 동의해주세요'),
});

export const CreateProfileInputSchema = z.object({
  name: z
    .string()
    .min(1, '닉네임을 입력해주세요')
    .max(20, '닉네임은 20자를 넘을 수 없어요'),
  handle: ProfileHandleSchema,
});

export const UpdateProfileInputSchema = CreateProfileInputSchema.extend({});
