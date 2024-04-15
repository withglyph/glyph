import { z } from 'zod';

export const PurchasePointSchema = z.object({
  paymentMethod: z.enum([
    'CREDIT_CARD',
    'BANK_ACCOUNT',
    'VIRTUAL_BANK_ACCOUNT',
    'PHONE_BILL',
    'GIFTCARD_CULTURELAND',
    'GIFTCARD_SMARTCULTURE',
    'GIFTCARD_BOOKNLIFE',
    'PAYPAL',
  ]),
  pointAmount: z.number(),
  pointAgreement: z.boolean().refine((v) => v, '약관에 동의해주세요'),
});
