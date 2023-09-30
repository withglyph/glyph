import { z } from 'zod';

const email = z
  .string()
  .min(1, '이메일을 입력해주세요')
  .max(255, '이메일은 255자를 넘을 수 없어요')
  .email('잘못된 이메일 형식이에요');

const name = z.string().min(1, '닉네임을 입력해주세요').max(20, '닉네임은 20자를 넘을 수 없어요');

const password = z.string().min(8, '8자 이상으로 입력해주세요');

export const LoginInputSchema = z.object({
  email,
  password,
});

export const SignUpInputSchema = LoginInputSchema.extend({
  name,
  passwordConfirm: z.string(),
  termsConsent: z.boolean().refine((v) => v, '필수 약관에 동의해주세요'),
  marketingConsent: z.boolean(),
}).refine((v) => v.password === v.passwordConfirm, {
  message: '비밀번호가 일치하지 않아요',
  path: ['passwordConfirm'],
});

export const UpdateUserProfileInputSchema = z.object({
  name,
});

export const RequestUserPasswordResetInputSchema = z.object({
  email,
});

export const RequestUserEmailUpdateInputSchema = z.object({
  email,
});

export const ResetUserPasswordInputSchema = z
  .object({
    password,
    passwordConfirm: z.string(),
    code: z.string(),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    message: '비밀번호가 일치하지 않아요',
    path: ['passwordConfirm'],
  });

export const UpdateUserPasswordInputSchema = z
  .object({
    oldPassword: password.optional(),
    newPassword: password,
    newPasswordConfirm: z.string(),
  })
  .refine((v) => v.newPassword === v.newPasswordConfirm, {
    message: '비밀번호가 일치하지 않아요',
    path: ['newPasswordConfirm'],
  });
