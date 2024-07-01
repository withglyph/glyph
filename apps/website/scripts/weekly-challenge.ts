/* cSpell:disable */

import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import dayjs from 'dayjs';
import { and, eq, gt, isNull, lte } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import open from 'open';
import { setupDayjs } from '$lib/datetime';
import {
  database,
  PostRevisionContents,
  PostRevisions,
  Posts,
  PostTags,
  UserEventEnrollments,
} from '$lib/server/database';
import { useFirstRow } from '$lib/server/utils/database';

setupDayjs();
const rl = createInterface(stdin, stdout);

const challengeEventCode = 'weekly_challenge_24064';
const challengeTagId = 'hpmxnzxrny5mgrqe';
const challengeStart = dayjs.kst('2024-06-24').startOf('day');
const challengeEnd = dayjs.kst('2024-06-30').endOf('day');

const FreePostRevisionContents = alias(PostRevisionContents, 'free_post_revision_contents');
const PaidPostRevisionContents = alias(PostRevisionContents, 'paid_post_revision_contents');

let offset = 0;
// eslint-disable-next-line no-constant-condition
while (true) {
  const post = await database
    .select({
      id: Posts.id,
      permalink: Posts.permalink,
      title: PostRevisions.title,
      userId: Posts.userId,
      freeContentLength: FreePostRevisionContents.characters,
      freeContentImageCount: FreePostRevisionContents.images,
      paidContentLength: PaidPostRevisionContents.characters,
      paidContentImageCount: PaidPostRevisionContents.images,
    })
    .from(Posts)
    .innerJoin(PostRevisions, eq(Posts.publishedRevisionId, PostRevisions.id))
    .innerJoin(FreePostRevisionContents, eq(PostRevisions.freeContentId, FreePostRevisionContents.id))
    .leftJoin(PaidPostRevisionContents, eq(PostRevisions.paidContentId, PaidPostRevisionContents.id))
    .innerJoin(PostTags, eq(Posts.id, PostTags.postId))
    .leftJoin(
      UserEventEnrollments,
      and(
        eq(Posts.userId, UserEventEnrollments.userId),
        eq(UserEventEnrollments.eventCode, challengeEventCode),
        eq(UserEventEnrollments.eligible, true),
      ),
    )
    .where(
      and(
        eq(Posts.state, 'PUBLISHED'),
        eq(Posts.visibility, 'PUBLIC'),
        isNull(Posts.password),
        eq(PostTags.tagId, challengeTagId),
        gt(Posts.publishedAt, challengeStart),
        lte(Posts.publishedAt, challengeEnd),
        isNull(UserEventEnrollments.id),
      ),
    )
    .orderBy(Posts.id)
    .limit(1)
    .offset(offset)
    .then(useFirstRow);

  if (!post) {
    break;
  }

  if (
    post.freeContentLength + (post.paidContentLength ?? 0) < 800 &&
    post.freeContentImageCount + (post.paidContentImageCount ?? 0) < 1
  ) {
    offset++;
    continue;
  }
  open(`https://glph.to/${Number(post.permalink).toString(36)}`, { wait: false });
  const answer = await rl.question(`${post.title} 추가할까요? (Y/n): `);

  if (answer === 'n' || answer === 'N' || answer === 'ㅜ') {
    offset++;
    continue;
  }

  await database.insert(UserEventEnrollments).values({
    userId: post.userId,
    eventCode: challengeEventCode,
    eligible: true,
  });
}
console.log('offset', offset);
// eslint-disable-next-line unicorn/no-process-exit
process.exit(0);
