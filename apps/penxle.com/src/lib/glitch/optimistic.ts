import type { GraphCacheConfig } from '$glitch';

export const optimistic: GraphCacheConfig['optimistic'] = {
  likePost: ({ input }, cache) => ({
    __typename: 'Post',
    id: input.postId,
    liked: true,
    likeCount: (cache.resolve({ __typename: 'Post', id: input.postId }, 'likeCount') as number) + 1,
  }),

  unlikePost: ({ input }, cache) => ({
    __typename: 'Post',
    id: input.postId,
    liked: false,
    likeCount: (cache.resolve({ __typename: 'Post', id: input.postId }, 'likeCount') as number) - 1,
  }),
};
