import { z } from 'zod';

const email = z
  .string()
  .min(1, '이메일을 입력해주세요')
  .max(255, '이메일은 255자를 넘을 수 없어요')
  .email('잘못된 이메일 형식이에요');

const name = z.string().min(1, '닉네임을 입력해주세요').max(20, '닉네임은 20자를 넘을 수 없어요');

export const LoginUserSchema = z.object({
  email,
});

export const CreateUserSchema = z.object({
  token: z.string(),
  name,
  termsConsent: z.boolean().refine((v) => v, '필수 약관에 동의해주세요'),
  marketingConsent: z.boolean(),
});

export const UpdateUserEmailSchema = z.object({
  email,
});

export const UpdateUserProfileSchema = z.object({
  name,
});

export const IssueUserEmailAuthorizationUrlSchema = z.object({
  email,
  code: z.string().min(1, '인증 코드를 입력해주세요'),
});
