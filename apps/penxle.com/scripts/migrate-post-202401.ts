/* eslint-disable unicorn/prefer-top-level-await */
import { prismaClient } from '$lib/server/database';
import { createId } from '$lib/utils';

const chunkSize = 100;

const contentFilterTagNames = {
  CRIME: '약물_범죄',
  CRUELTY: '잔인성',
  GAMBLING: '사행성',
  GROSSNESS: '벌레_징그러움',
  HORROR: '공포성',
  INSULT: '언어의_부적절성',
  OTHER: '기타',
  PHOBIA: '정신질환_공포증',
  TRAUMA: '트라우마',
  VIOLENCE: '폭력성',
};

const contentFilterTagIds: Record<string, string> = {};
for (const [category, tagName] of Object.entries(contentFilterTagNames)) {
  await prismaClient.tag
    .upsert({
      select: { id: true },
      where: { name: tagName },
      create: {
        id: createId(),
        name: tagName,
      },
      update: {},
    })
    .then((tag) => (contentFilterTagIds[category] = tag.id));
}

console.log('Migrating posts...');

let postCount: number | undefined;
prismaClient.post.count().then((count) => (postCount = count));

for (let i = 0; ; i++) {
  const posts = await prismaClient.post.findMany({
    include: {
      publishedRevision: {
        include: { tags: true },
      },
      revisions: true,
    },
    orderBy: { id: 'asc' },
    take: chunkSize,
    skip: chunkSize * i,
  });

  if (posts.length === 0) {
    break;
  }

  await Promise.all(
    posts.map((post) => {
      return prismaClient.post.update({
        where: { id: post.id },
        data: {
          thumbnail: post.publishedRevision?.croppedThumbnailId
            ? { connect: { id: post.publishedRevision.croppedThumbnailId } }
            : undefined,
          ageRating: post.contentFilters.includes('ADULT') ? 'R19' : 'ALL',
          tags: {
            createMany: {
              data: [
                ...(post.publishedRevision?.tags.map((postRevisionTag) => ({
                  id: createId(),
                  tagId: postRevisionTag.tagId,
                  kind: 'EXTRA' as const,
                })) ?? []),
                ...post.contentFilters
                  .filter((contentFilter) => contentFilter !== 'ADULT')
                  .map((contentFilter) => ({
                    id: createId(),
                    tagId: contentFilterTagIds[contentFilter],
                    kind: 'TRIGGER' as const,
                  })),
              ],
              skipDuplicates: true,
            },
          },
        },
      });
    }),
  );

  console.log(`Migrated ${chunkSize * i + posts.length}/${postCount ?? '??'} posts`);
}

console.log('Migrating post revisions...');

for (let i = 0; ; i++) {
  const revisions = await prismaClient.postRevision.findMany({
    select: { id: true },
    where: { autoIndent: false },
    orderBy: { id: 'asc' },
    take: chunkSize,
    skip: chunkSize * i,
  });

  if (revisions.length === 0) {
    break;
  }

  await prismaClient.postRevision.updateMany({
    where: { id: { in: revisions.map(({ id }) => id) } },
    data: { paragraphIndent: 0 },
  });

  console.log(`Migrated ${chunkSize * i + revisions.length} post revisions`);
}
