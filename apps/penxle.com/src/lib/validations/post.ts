import { z } from 'zod';

export const PublishPostInputSchema = z.object({
  contentFilters: z.array(
    z.enum([
      'ADULT',
      'CRIME',
      'CRUELTY',
      'GAMBLING',
      'GROSSNESS',
      'HORROR',
      'INSULT',
      'OTHER',
      'PHOBIA',
      'TRAUMA',
      'VIOLENCE',
    ]),
  ),
  discloseStats: z.boolean(),
  password: z
    .union([z.string().regex(/^[!-~]*$/, '영문, 숫자, 키보드 특수문자만 입력할 수 있어요'), z.null()])
    .optional(),
  revisionId: z.string(),
  receiveFeedback: z.boolean(),
  receivePatronage: z.boolean(),
  receiveTagContribution: z.boolean(),
  visibility: z.enum(['PUBLIC', 'SPACE', 'UNLISTED']),
});

export type PublishPostInput = z.infer<typeof PublishPostInputSchema>;
