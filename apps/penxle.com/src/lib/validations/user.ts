import { z } from 'zod';
import { email, profileName as name } from './common';

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
  avatarId: z.string(),
  name,
});

export const IssueUserEmailAuthorizationUrlSchema = z.object({
  email,
  code: z.string().min(1, '인증 코드를 입력해주세요'),
});

export const DeleteUserSchema = z.object({
  email,
});

export const VerifySettlementIdentitySchema = z.object({
  residentRegistrationNumberBack: z
    .string()
    .trim()
    .regex(/^\d{7}$/),
  idCardIssuedDate: z
    .string()
    .trim()
    .regex(/^(\d{4})\.?(0?\d|1[0-2])\.?(0?[1-9]|[12]\d|3[01])$/)
    .transform((v) => v.replaceAll('.', '')),
  bankCode: z.string().regex(/^\d{3}$/),
  bankAccountNumber: z
    .string()
    .regex(/^(?:\d+-)*\d+$/)
    .transform((v) => v.replaceAll('-', '')),
});
