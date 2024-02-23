import { z } from 'zod';
import { tagPattern } from '$lib/const/post';

export const RevisePostInputSchema = z.object({
  revisionKind: z.enum(['AUTO_SAVE', 'MANUAL_SAVE']),
  postId: z.string(),
  title: z.string().max(100).nullable().optional(),
  subtitle: z.string().max(100).nullable().optional(),
  content: z.any(),
  paragraphIndent: z.number().int(),
  paragraphSpacing: z.number().int(),
});

export const PublishPostInputSchema = z.object({
  revisionId: z.string(),
  spaceId: z.string(),
  collectionId: z.string().optional(),
  thumbnailId: z.string().optional(),
  visibility: z.enum(['PUBLIC', 'SPACE', 'UNLISTED']),
  password: z
    .union([z.string().regex(/^[!-~]*$/, '영문, 숫자, 키보드 특수문자만 입력할 수 있어요'), z.null()])
    .optional(),
  ageRating: z.enum(['ALL', 'R15', 'R19']),
  externalSearchable: z.boolean(),
  discloseStats: z.boolean(),
  receiveFeedback: z.boolean(),
  receivePatronage: z.boolean(),
  receiveTagContribution: z.boolean(),
  protectContent: z.boolean(),
  receiveComment: z.boolean().default(true),
  category: z.enum(['ORIGINAL', 'FANFICTION', 'NONFICTION', 'OTHER']),
  pairs: z.array(z.enum(['BL', 'GL', 'HL', 'MULTIPLE', 'NONCP', 'OTHER'])),
  tags: z.array(
    z.object({
      name: z.string().regex(new RegExp(tagPattern, 'u'), '태그에 허용되지 않는 문자예요').trim(),
      kind: z.enum(['TITLE', 'COUPLING', 'CHARACTER', 'TRIGGER', 'EXTRA']),
    }),
  ),
});

export type PublishPostInput = z.infer<typeof PublishPostInputSchema>;
