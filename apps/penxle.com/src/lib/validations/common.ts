import { z } from 'zod';

export const email = z
  .string()
  .min(1, '이메일을 입력해주세요')
  .max(255, '이메일은 255자를 넘을 수 없어요')
  .email('잘못된 이메일 형식이에요');

export const profileName = z.string().trim().min(1, '닉네임을 입력해주세요').max(20, '닉네임은 20자를 넘을 수 없어요');
