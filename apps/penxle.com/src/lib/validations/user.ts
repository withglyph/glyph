import { z } from 'zod';

export const LoginInputSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .max(255, '이메일은 255자를 넘을 수 없어요')
    .email('이메일 형식에 맞게 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export const SignUpInputSchema = LoginInputSchema.extend({
  name: z
    .string()
    .min(1, '닉네임을 입력해주세요')
    .max(20, '닉네임은 20자를 넘을 수 없어요'),
  password: z.string().min(8, '8자 이상으로 입력해주세요'),
  isAgreed: z.boolean().refine((v) => v, '약관에 동의해주세요'),
});

export const UpdateUserProfileInputSchema = z.object({
  name: z
    .string()
    .min(1, '닉네임을 입력해주세요')
    .max(20, '닉네임은 20자를 넘을 수 없어요'),
});

export const RequestPasswordResetInputSchema = z.object({
  email: z.string().email('잘못된 이메일 형식이에요'),
});

export const ResetPasswordInputSchema = z.object({
  password: z.string().min(8, '8자 이상으로 입력해주세요'),
  token: z.string(),
});
