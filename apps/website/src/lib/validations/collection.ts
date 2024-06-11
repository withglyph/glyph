import { z } from 'zod';

const name = z.string().trim().min(1, '컬렉션 이름을 입력해주세요').max(50, '컬렉션 이름은 50자를 넘을 수 없어요');

export const CreateSpaceCollectionSchema = z.object({
  spaceId: z.string(),
  name,
  description: z.string().optional(),
  thumbnailId: z.string().optional(),
});

export const UpdateSpaceCollectionSchema = z.object({
  spaceCollectionId: z.string(),
  name,
  thumbnailId: z.string().optional(),
  description: z.string().optional(),
});

export const SetSpaceCollectionPostSchema = z.object({
  spaceCollectionId: z.string(),
  postIds: z.array(z.string()),
});

export const AppendSpaceCollectionPostsSchema = z.object({
  spaceCollectionId: z.string(),
  postIds: z.array(z.string()),
});
