import dayjs from 'dayjs';
import { setupDayjs } from '$lib/datetime';
import { prismaClient } from '$lib/server/database';
import { revisionContentToText } from '$lib/server/utils/tiptap';
import { createId } from '$lib/utils';

setupDayjs();

const eventPosts = await prismaClient.post.findMany({
  select: {
    userId: true,
    tags: true,
    publishedRevision: {
      select: {
        freeContent: true,
        paidContent: true,
      },
    },
  },
  where: {
    visibility: 'PUBLIC',
    state: 'PUBLISHED',
    password: null,
    space: {
      state: 'ACTIVE',
      visibility: 'PUBLIC',
    },
    publishedAt: { gte: dayjs.kst('2024-02-09').toDate() },
  },
});

const eventPostCounts: Record<string, number> = {};
for (const post of eventPosts) {
  if (post.tags.length >= 3) {
    const contentText = post.publishedRevision?.freeContent
      ? await revisionContentToText(post.publishedRevision.freeContent)
      : '';
    const paidContentText = post.publishedRevision?.paidContent
      ? await revisionContentToText(post.publishedRevision.paidContent)
      : '';
    if (contentText.length + paidContentText.length >= 300) {
      eventPostCounts[post.userId] = (eventPostCounts[post.userId] ?? 0) + 1;
      if (eventPostCounts[post.userId] >= 2) {
        await prismaClient.userEventEnrollment.upsert({
          where: {
            userId_eventCode: {
              userId: post.userId,
              eventCode: 'post_publish_202402',
            },
          },
          create: {
            id: createId(),
            userId: post.userId,
            eventCode: 'post_publish_202402',
            eligible: true,
          },
          update: {
            eligible: true,
          },
        });
      }
    }
  }
}
