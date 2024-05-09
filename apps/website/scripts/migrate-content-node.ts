import { eq } from 'drizzle-orm';
import { database, PostRevisionContents } from '$lib/server/database';
import { getMetadataFromTiptapDocument } from '$lib/utils';

const BATCH_SIZE = 100;

for (let i = 0; ; i++) {
  const contents = await database
    .select({
      id: PostRevisionContents.id,
      data: PostRevisionContents.data,
    })
    .from(PostRevisionContents)
    .orderBy(PostRevisionContents.id)
    .limit(BATCH_SIZE);

  if (contents.length === 0) {
    break;
  }

  console.time(`Migrated ${i * BATCH_SIZE + contents.length} contents`);

  await Promise.all(
    contents.map(async (content) => {
      const { text, characters, images, files } = getMetadataFromTiptapDocument({
        type: 'document',
        content: content.data,
      });

      await database
        .update(PostRevisionContents)
        .set({ text, characters, images, files })
        .where(eq(PostRevisionContents.id, content.id));
    }),
  );

  console.timeEnd(`Migrated ${i * BATCH_SIZE + contents.length} contents`);
}
