import { z } from 'zod';

const name = z.string().trim().min(1, '컬렉션 이름을 입력해주세요');

export const CreateSpaceCollectionSchema = z.object({
  spaceId: z.string(),
  name,
});

export const UpdateSpaceCollectionSchema = z.object({
  collectionId: z.string(),
  name,
  thumbnailId: z.string().optional(),
});

export const SetSpaceCollectionPostSchema = z.object({
  collectionId: z.string(),
  postIds: z.array(z.string()),
});
