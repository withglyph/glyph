import { and, desc, eq, inArray, isNotNull } from 'drizzle-orm';
import { disassembleHangulString, InitialHangulString } from '$lib/utils';
import {
  database,
  PostRevisions,
  Posts,
  PostTags,
  SpaceCollectionPosts,
  SpaceCollections,
  Spaces,
  Tags,
} from '../database';
import { elasticSearch, indexName } from '../search';
import { calculateCollectionReputation, calculatePostReputation, getTagUsageCount, useFirstRow } from '../utils';
import { enqueueJob } from '.';
import { defineJob } from './types';

export const IndexPostJob = defineJob('indexPost', async (postId: string) => {
  const post = await database
    .select({
      title: PostRevisions.title,
      subtitle: PostRevisions.subtitle,
      category: Posts.category,
      ageRating: Posts.ageRating,
      publishedAt: Posts.publishedAt,
      spaceId: Spaces.id,
      spaceName: Spaces.name,
    })
    .from(Posts)
    .innerJoin(Spaces, eq(Posts.spaceId, Spaces.id))
    .innerJoin(PostRevisions, eq(Posts.publishedRevisionId, PostRevisions.id))
    .where(
      and(
        eq(Posts.id, postId),
        eq(Posts.state, 'PUBLISHED'),
        eq(Posts.visibility, 'PUBLIC'),
        eq(Spaces.visibility, 'PUBLIC'),
      ),
    )
    .then(useFirstRow);

  if (post) {
    const tags = await database
      .select({ Tags, kind: PostTags.kind })
      .from(Tags)
      .innerJoin(PostTags, eq(PostTags.tagId, Tags.id))
      .where(eq(PostTags.postId, postId))
      .then((rows) => rows.map((row) => ({ ...row.Tags, kind: row.kind })));

    const reputation = await calculatePostReputation(postId);

    await elasticSearch.index({
      index: indexName('posts'),
      id: postId,
      body: {
        title: post.title,
        subtitle: post.subtitle,
        category: post.category,
        ageRating: post.ageRating,
        publishedAt: post.publishedAt,
        reputation,
        tags: tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          kind: tag.kind,
        })),
        space: {
          id: post.spaceId,
          name: post.spaceName,
        },
      },
    });

    const indexableTagData = await Promise.all(
      tags.map(async (tag) => ({
        id: tag.id,
        name: {
          raw: tag.name,
          disassembled: disassembleHangulString(tag.name),
          initial: InitialHangulString(tag.name) || null,
        },

        usageCount: await getTagUsageCount(tag.id),
      })),
    );

    await elasticSearch.bulk({
      index: indexName('tags'),
      operations: indexableTagData.flatMap((data) => {
        const { id, ...idOmittedData } = data;
        return [{ index: { _id: id } }, idOmittedData];
      }),
    });
  } else {
    await elasticSearch
      .delete({
        index: indexName('posts'),
        id: postId,
      })
      .catch(() => null);
  }
});

export const IndexAllPostsInSpaceJob = defineJob('indexAllPostsInSpace', async (spaceId: string) => {
  const postIds = await database
    .select({ id: Posts.id })
    .from(Posts)
    .where(and(eq(Posts.spaceId, spaceId), inArray(Posts.state, ['PUBLISHED', 'DELETED'])))
    .then((rows) => rows.map((row) => row.id));

  await Promise.all(postIds.map((postId) => enqueueJob('indexPost', postId)));
});

type IndexCollectionJobParams = { collectionId: string } | { postId: string };

export const IndexCollectionJob = defineJob('indexCollection', async (params: IndexCollectionJobParams) => {
  const collectionId =
    'collectionId' in params
      ? params.collectionId
      : await database
          .select({ collectionId: SpaceCollectionPosts.collectionId })
          .from(SpaceCollectionPosts)
          .where(eq(SpaceCollectionPosts.postId, params.postId))
          .then(useFirstRow)
          .then((row) => row?.collectionId);

  if (!collectionId) {
    return;
  }

  const collection = await database
    .select({
      id: SpaceCollections.id,
      name: SpaceCollections.name,
      spaceId: SpaceCollections.spaceId,
      thumbnailId: SpaceCollections.thumbnailId,
      lastPostPublishedAt: Posts.publishedAt,
    })
    .from(SpaceCollections)
    .innerJoin(SpaceCollectionPosts, eq(SpaceCollections.id, SpaceCollectionPosts.collectionId))
    .innerJoin(Posts, eq(SpaceCollectionPosts.postId, Posts.id))
    .where(
      and(
        eq(SpaceCollections.id, collectionId),
        eq(SpaceCollections.state, 'ACTIVE'),
        eq(Posts.state, 'PUBLISHED'),
        eq(Posts.visibility, 'PUBLIC'),
        isNotNull(Posts.publishedAt),
      ),
    )
    .orderBy(desc(Posts.publishedAt))
    .limit(1)
    .then(useFirstRow);

  if (!collection) {
    await elasticSearch
      .delete({
        index: indexName('collections'),
        id: collectionId,
      })
      .catch(() => null);
    return;
  }

  await elasticSearch.index({
    index: indexName('collections'),
    id: collection.id,
    document: {
      name: collection.name,
      space: {
        id: collection.spaceId,
      },
      reputation: await calculateCollectionReputation(collection.id),
      hasThumbnail: !!collection.thumbnailId,
      lastPostPublishedAt: collection.lastPostPublishedAt?.toDate(),
    },
  });
});
