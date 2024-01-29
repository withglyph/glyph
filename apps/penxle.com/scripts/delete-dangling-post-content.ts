/* eslint-disable unicorn/prefer-top-level-await */
import { prismaClient } from '$lib/server/database';

let danglingContentCount: number | undefined;

prismaClient.postRevisionContent
  .count({
    where: {
      revisionsUsingThisAsFreeContent: { none: {} },
      revisionsUsingThisAsPaidContent: { none: {} },
    },
  })
  .then((count) => {
    danglingContentCount = count;
  });

console.log('Start to delete dangling PostContent...');

for (let i = 0; ; i++) {
  const danglingContents = await prismaClient.postRevisionContent.findMany({
    where: {
      revisionsUsingThisAsFreeContent: { none: {} },
      revisionsUsingThisAsPaidContent: { none: {} },
    },
    take: 1000,
  });

  await prismaClient.postRevisionContent.deleteMany({
    where: {
      id: { in: danglingContents.map((c) => c.id) },
    },
  });

  console.log(`Deleted ${i * 1000 + danglingContents.length}/${danglingContentCount ?? '??'} PostContent`);
  if (danglingContents.length < 1000) break;
}
