#!/usr/bin/env node

import { and, eq, isNull, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { database, inArray, PostRevisionContents, PostRevisions } from '$lib/server/database';

await database.execute(sql`set session_replication_role = replica`);

for (let i = 0; ; i++) {
  console.time(`Elapsed Time`);

  const RevisionsAsFreeContent = alias(PostRevisions, 'RevisionsAsFreeContent');
  const RevisionsAsPaidContent = alias(PostRevisions, 'RevisionsAsPaidContent');
  const posts = await database
    .select({ id: PostRevisionContents.id })
    .from(PostRevisionContents)
    .leftJoin(RevisionsAsFreeContent, eq(PostRevisionContents.id, RevisionsAsFreeContent.freeContentId))
    .leftJoin(RevisionsAsPaidContent, eq(PostRevisionContents.id, RevisionsAsPaidContent.paidContentId))
    .where(and(isNull(RevisionsAsFreeContent.id), isNull(RevisionsAsPaidContent.id)))
    .limit(5000);

  if (posts.length === 0) {
    break;
  }

  const ids = posts.map((post) => post.id);
  await database.delete(PostRevisionContents).where(inArray(PostRevisionContents.id, ids));

  console.log(`Deleted ${i * 5000 + posts.length} contents`);
  console.timeEnd(`Elapsed Time`);
}

console.log('Done');
process.exit(0);
