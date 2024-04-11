import { and, eq, inArray } from 'drizzle-orm';
import { disassembleHangulString, InitialHangulString } from '$lib/utils';
import { database, PostRevisions, Posts, PostTags, Spaces, Tags } from '../database';
import { elasticSearch, indexName } from '../search';
import { calculatePostReputation, getTagUsageCount, useFirstRow } from '../utils';
import { enqueueJob } from '.';
import { defineJob } from './types';

export const IndexPostJob = defineJob('indexPost', async (postId: string) => {
  const post = await database
    .select({
      title: PostRevisions.title,
      subtitle: PostRevisions.subtitle,
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
