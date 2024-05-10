import { eq } from 'drizzle-orm';
import { database, PostContentStates, PostRevisionContents } from '$lib/server/database';
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
    .limit(BATCH_SIZE)
    .offset(i * BATCH_SIZE);

  if (contents.length === 0) {
    break;
  }

  console.time(`Migrated ${i * BATCH_SIZE + contents.length} revision contents`);

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

  console.timeEnd(`Migrated ${i * BATCH_SIZE + contents.length} revision contents`);
}

for (let i = 0; ; i++) {
  const states = await database
    .select({
      id: PostContentStates.id,
      content: PostContentStates.content,
    })
    .from(PostContentStates)
    .orderBy(PostContentStates.id)
    .limit(BATCH_SIZE)
    .offset(i * BATCH_SIZE);

  if (states.length === 0) {
    break;
  }

  console.time(`Migrated ${i * BATCH_SIZE + states.length} content states`);

  await Promise.all(
    states.map(async (state) => {
      const { text, characters, images, files } = getMetadataFromTiptapDocument(state.content);

      await database
        .update(PostContentStates)
        .set({ text, characters, images, files })
        .where(eq(PostContentStates.id, state.id));
    }),
  );

  console.timeEnd(`Migrated ${i * BATCH_SIZE + states.length} content states`);
}
