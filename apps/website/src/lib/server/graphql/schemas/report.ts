import { eq } from 'drizzle-orm';
import { database, PostComments, PostRevisions, Posts, Spaces } from '$lib/server/database';
import { logToSlack, useFirstRow } from '$lib/server/utils';
import { builder } from '../builder';

builder.mutationFields((t) => ({
  reportPost: t.withAuth({ user: true }).field({
    type: 'Void',
    nullable: true,
    args: {
      postId: t.arg.id(),
      reason: t.arg.string({ required: false }),
    },
    resolve: async (_, args, context) => {
      const data = await database
        .select({
          title: PostRevisions.title,
          permalink: Posts.permalink,
          slug: Spaces.slug,
        })
        .from(Posts)
        .innerJoin(PostRevisions, eq(Posts.publishedRevisionId, PostRevisions.id))
        .innerJoin(Spaces, eq(Posts.spaceId, Spaces.id))
        .where(eq(Posts.id, args.postId))
        .then(useFirstRow);

      if (data) {
        await logToSlack('report', {
          content: `UserID ${context.session.userId} 포스트 신고: ${data.title}
포스트 ID: ${args.postId}
이유: ${args.reason}
${context.event.url.origin}/${data.slug}/${data.permalink}`,
        });
      }
    },
  }),

  reportComment: t.withAuth({ user: true }).field({
    type: 'Void',
    nullable: true,
    args: {
      commentId: t.arg.id(),
      reason: t.arg.string({ required: false }),
    },
    resolve: async (_, args, context) => {
      const data = await database
        .select({
          title: PostRevisions.title,
          permalink: Posts.permalink,
          slug: Spaces.slug,
          commentContent: PostComments.content,
        })
        .from(PostComments)
        .innerJoin(Posts, eq(PostComments.postId, Posts.id))
        .innerJoin(PostRevisions, eq(Posts.publishedRevisionId, PostRevisions.id))
        .innerJoin(Spaces, eq(Posts.spaceId, Spaces.id))
        .where(eq(PostComments.id, args.commentId))
        .then(useFirstRow);

      if (data) {
        await logToSlack('report', {
          content: `UserID ${context.session.userId} 댓글 신고
댓글 ID: ${args.commentId}
내용: ${data.commentContent}
이유: ${args.reason}
${context.event.url.origin}/${data.slug}/${data.permalink}`,
        });
      }
    },
  }),
}));
