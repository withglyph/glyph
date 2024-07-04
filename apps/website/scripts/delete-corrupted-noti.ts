import { eq } from 'drizzle-orm';
import { database, PostComments, UserNotifications } from '$lib/server/database';
import { useFirstRow } from '$lib/server/utils';

for (let i = 0; ; i += 100) {
  const notifications = await database
    .select()
    .from(UserNotifications)
    .where(eq(UserNotifications.category, 'COMMENT'))
    .orderBy(UserNotifications.id)
    .limit(100)
    .offset(i);

  if (notifications.length === 0) {
    break;
  }

  await Promise.all(
    notifications.map(async (notification) => {
      const data = notification.data as { commentId: string };
      const comment = await database
        .select({ id: PostComments.id })
        .from(PostComments)
        .where(eq(PostComments.id, data.commentId))
        .then(useFirstRow);

      if (!comment) {
        console.log(`Deleting corrupted notification: ${notification.id}`);
        await database.delete(UserNotifications).where(eq(UserNotifications.id, notification.id));
        i--;
      }
    }),
  );
}

console.log('Done!');
