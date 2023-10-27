import { z } from 'zod';

export const PurchasePointSchema = z.object({
  paymentMethod: z.enum([
    'BANK_ACCOUNT',
    'CREDIT_CARD',
    'GIFTCARD_CULTURELAND',
    'GIFTCARD_HAPPYMONEY',
    'PAYPAL',
    'PHONE_BILL',
    'TOSS_PAY',
    'VIRTUAL_BANK_ACCOUNT',
  ]),
  pointAmount: z.number(),
  pointAgreement: z.boolean().refine((v) => v, '약관에 동의해주세요'),
});
