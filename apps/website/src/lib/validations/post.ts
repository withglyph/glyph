import { z } from 'zod';
import { tagPattern } from '$lib/const/post';

export const PublishPostInputSchema = z.object({
  postId: z.string(),
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
  commentQualification: z.enum(['ANY', 'IDENTIFIED', 'NONE']).default('ANY'),
  category: z.enum(['ORIGINAL', 'FANFICTION', 'NONFICTION', 'OTHER']),
  pairs: z.array(z.enum(['BL', 'GL', 'HL', 'MULTIPLE', 'NONCP', 'OTHER'])),
  tags: z.array(
    z.object({
      name: z.string().regex(new RegExp(tagPattern, 'u'), '태그에 허용되지 않는 문자예요').trim(),
      kind: z.enum(['TITLE', 'COUPLING', 'CHARACTER', 'TRIGGER', 'EXTRA', 'CHALLENGE']),
    }),
  ),
});

export type PublishPostInput = z.infer<typeof PublishPostInputSchema>;

export const UpdatePostTagsInputSchema = z.object({
  postId: z.string(),
  category: z.enum(['ORIGINAL', 'FANFICTION', 'NONFICTION', 'OTHER']),
  pairs: z.array(z.enum(['BL', 'GL', 'HL', 'MULTIPLE', 'NONCP', 'OTHER'])),
  tags: z.array(
    z.object({
      name: z.string().regex(new RegExp(tagPattern, 'u'), '태그에 허용되지 않는 문자예요').trim(),
      kind: z.enum(['TITLE', 'COUPLING', 'CHARACTER', 'TRIGGER', 'EXTRA', 'CHALLENGE']),
    }),
  ),
});
