import { z } from 'zod';

export const CreatePostInputSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  content: z.string().min(1, '내용을 입력해주세요'),
  spaceId: z.string(),
});
