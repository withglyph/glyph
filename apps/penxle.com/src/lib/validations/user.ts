import { z } from 'zod';
import { email, profileName as name, YYYYMMDD } from './common';

export const LoginUserSchema = z.object({
  email,
});

export const CreateUserSchema = z.object({
  token: z.string(),
  name,
  termsConsent: z.boolean().refine((v) => v, '필수 약관에 동의해주세요'),
  isGte14: z.boolean().refine((v) => v, '만 14세 이상만 가입할 수 있어요'),
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
    .length(7, '주민등록번호 뒷자리를 입력해주세요')
    .regex(/^\d{7}$/, '올바른 주민등록번호를 입력해주세요'),
  idCardIssuedDate: YYYYMMDD,
  bankCode: z.string().regex(/^\d{3}$/, '은행을 선택해주세요'),
  bankAccountNumber: z
    .string()
    .min(1, '계좌번호를 입력해주세요')
    .regex(/^(?:\d+-)*\d+$/, '올바른 계좌번호를 입력해주세요')
    .transform((v) => v.replaceAll('-', '')),
});

export const VerifyPassportIdentitySchema = z.object({
  name: z.string().trim().min(1, '이름을 입력해주세요'),
  birthday: YYYYMMDD,
  issuedDate: YYYYMMDD,
  expirationDate: YYYYMMDD,
  passportNumber: z.string().trim().min(1, '여권 번호를 입력해주세요'),
});
