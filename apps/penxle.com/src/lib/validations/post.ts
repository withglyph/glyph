import { z } from 'zod';

export const UpdatePostOptionsInputSchema = z.object({
  contentFilters: z
    .array(
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
    )
    .optional(),
  discloseStats: z.boolean().optional(),
  password: z
    .union([z.string().regex(/^[!-~]*$/, '영문, 숫자, 키보드 특수문자만 입력할 수 있어요'), z.null()])
    .optional(),
  postId: z.string(),
  receiveFeedback: z.boolean().optional(),
  receivePatronage: z.boolean().optional(),
  receiveTagContribution: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(['PUBLIC', 'SPACE', 'UNLISTED']).optional(),
});

export type UpdatePostOptionsInput = z.infer<typeof UpdatePostOptionsInputSchema>;
