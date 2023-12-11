import { z } from 'zod';

export const UpdateSpaceCollectionSchema = z.object({
  collectionId: z.string(),
  name: z.string(),
  thumbnailId: z.string().optional(),
});

export const SetSpaceCollectionPostSchema = z.object({
  collectionId: z.string(),
  postIds: z.array(z.string()),
});
