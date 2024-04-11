/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Client } from '@elastic/elasticsearch';
import arg from 'arg';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import * as R from 'radash';
import { database, PostRevisions, Posts, PostTags, Spaces, Tags } from '$lib/server/database';
import { calculatePostReputation } from '$lib/server/utils/post';
import { getTagUsageCount } from '$lib/server/utils/tag';
import { disassembleHangulString, InitialHangulString } from '$lib/utils';

export const elasticSearch = new Client({
  cloud: { id: process.env.PRIVATE_ELASTICSEARCH_CLOUD_ID! },
  auth: { apiKey: process.env.PRIVATE_ELASTICSEARCH_API_KEY! },
});

const args = arg({
  '--production': Boolean,
  '--batch-size': Number,

  '-prod': '--production',
  '-b': '--batch-size',
});

const batchSize = args['--batch-size'] || 100;
const indexName = (name: string) => (args['--production'] ? name : `${name}-dev`);

for (let i = 0; ; i++) {
  const posts = await database
    .select({
      id: Posts.id,
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
        eq(Posts.state, 'PUBLISHED'),
        eq(Posts.visibility, 'PUBLIC'),
        eq(Spaces.visibility, 'PUBLIC'),
        isNull(Posts.password),
      ),
    )
    .orderBy(Posts.id)
    .limit(batchSize)
    .offset(i * batchSize);

  if (posts.length === 0) {
    break;
  }

  const tagRows = await database
    .select({ postId: PostTags.postId, tagId: PostTags.tagId, name: Tags.name, kind: PostTags.kind })
    .from(PostTags)
    .innerJoin(Tags, eq(PostTags.tagId, Tags.id))
    .where(
      and(
        inArray(
          PostTags.postId,
          posts.map((row) => row.id),
        ),
      ),
    );

  const postReputations = await Promise.all(posts.map((post) => calculatePostReputation(post.id)));

  const res = await elasticSearch.bulk({
    index: indexName('posts'),
    operations: posts.flatMap((post, index) => [
      { index: { _id: post.id } },
      {
        title: post.title,
        subtitle: post.subtitle,
        ageRating: post.ageRating,
        publishedAt: post.publishedAt?.toDate(),
        reputation: postReputations[index],
        tags: tagRows
          .filter((tagRow) => tagRow.postId === post.id)
          .map((tagRow) => ({ id: tagRow.tagId, name: tagRow.name, kind: tagRow.kind })),
        space: {
          id: post.spaceId,
          name: post.spaceName,
        },
      },
    ]),
  });

  console.log(res.items.find((item) => item.index?.error));

  const tags = R.unique(tagRows, (tagRow) => tagRow.tagId);

  const tagUsageCounts = await Promise.all(tags.map((tag) => getTagUsageCount(tag.tagId)));

  await elasticSearch.bulk({
    index: indexName('tags'),
    operations: tags.flatMap((tag, index) => [
      { index: { _id: tag.tagId } },
      {
        name: {
          raw: tag.name,
          disassembled: disassembleHangulString(tag.name),
          initial: InitialHangulString(tag.name) || null,
        },
        kind: tag.kind,
        usageCount: tagUsageCounts[index],
      },
    ]),
  });

  console.log(`Indexed ${i * batchSize + posts.length} posts`);
}

console.log('Post & Tag indexing completed!');
