import { z } from 'zod';

const email = z
  .string()
  .min(1, '이메일을 입력해주세요')
  .max(255, '이메일은 255자를 넘을 수 없어요')
  .email('잘못된 이메일 형식이에요');

const name = z
  .string()
  .min(1, '닉네임을 입력해주세요')
  .max(20, '닉네임은 20자를 넘을 수 없어요');

const password = z.string().min(8, '8자 이상으로 입력해주세요');

export const LoginInputSchema = z.object({
  email,
  password,
});

export const SignUpInputSchema = LoginInputSchema.extend({
  name,
  passwordConfirm: z.string(),
  isAgreed: z.boolean().refine((v) => v, '약관에 동의해주세요'),
}).refine((v) => v.password === v.passwordConfirm, {
  message: '비밀번호가 일치하지 않아요',
  path: ['passwordConfirm'],
});

export const UpdateUserProfileInputSchema = z.object({
  name,
});

export const EmailInputSchema = z.object({
  email,
});

export const ResetPasswordInputSchema = z.object({
  password,
  token: z.string(),
});

export const UpdatePasswordInputSchema = z.object({
  password,
});
