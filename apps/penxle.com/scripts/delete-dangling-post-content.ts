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

await prismaClient.$executeRawUnsafe('set session_replication_role = replica');

for (let i = 0; ; i++) {
  const danglingContents = await prismaClient.postRevisionContent.findMany({
    select: { id: true },
    where: {
      revisionsUsingThisAsFreeContent: { none: {} },
      revisionsUsingThisAsPaidContent: { none: {} },
    },
    take: 100,
  });

  await prismaClient.postRevisionContent.deleteMany({
    where: {
      id: { in: danglingContents.map((c) => c.id) },
    },
  });

  console.log(`Deleted ${i * 100 + danglingContents.length}/${danglingContentCount ?? '??'} PostContent`);
  if (danglingContents.length < 100) break;
}

await prismaClient.$executeRawUnsafe('set session_replication_role = DEFAULT');
