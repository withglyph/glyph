import dayjs from 'dayjs';
import { and, asc, eq, gt } from 'drizzle-orm';
import { yDocToProsemirrorJSON } from 'y-prosemirror';
import * as Y from 'yjs';
import { getMetadataFromTiptapDocument } from '$lib/utils';
import { database, PostContentSnapshots, PostContentStates, PostContentUpdates } from '../database';
import { defineJob } from './types';

export const UpdatePostContentStateJob = defineJob('updatePostContentState', async (postId: string) => {
  await database.transaction(async (tx) => {
    const states = await tx
      .select({
        update: PostContentStates.update,
        vector: PostContentStates.vector,
        upToSeq: PostContentStates.upToSeq,
      })
      .from(PostContentStates)
      .where(eq(PostContentStates.postId, postId))
      .for('update');

    if (states.length === 0) {
      return;
    }

    const [state] = states;

    const pendingUpdates = await tx
      .select({ data: PostContentUpdates.data, seq: PostContentUpdates.seq })
      .from(PostContentUpdates)
      .where(and(eq(PostContentUpdates.postId, postId), gt(PostContentUpdates.seq, state.upToSeq)))
      .orderBy(asc(PostContentUpdates.seq));

    if (pendingUpdates.length === 0) {
      return;
    }

    const pendingUpdate = Y.mergeUpdatesV2(pendingUpdates.map(({ data }) => data));

    const doc = new Y.Doc({ gc: false });

    Y.applyUpdateV2(doc, state.update);
    const prevSnapshot = Y.snapshot(doc);

    Y.applyUpdateV2(doc, pendingUpdate);
    const snapshot = Y.snapshot(doc);

    if (!Y.equalSnapshots(prevSnapshot, snapshot)) {
      await tx.insert(PostContentSnapshots).values({
        postId,
        data: Y.encodeSnapshotV2(snapshot),
      });
    }

    const updatedUpdate = Y.encodeStateAsUpdateV2(doc);
    const updatedVector = Y.encodeStateVector(doc);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const updatedUpToSeq = pendingUpdates.at(-1)!.seq;

    const title = doc.getText('title').toString();
    const subtitle = doc.getText('subtitle').toString();

    const content = yDocToProsemirrorJSON(doc, 'content');
    const { text, characters, images, files } = getMetadataFromTiptapDocument(content);

    await tx
      .update(PostContentStates)
      .set({
        update: updatedUpdate,
        vector: updatedVector,
        upToSeq: updatedUpToSeq,
        title: title.length > 0 ? title : null,
        subtitle: subtitle.length > 0 ? subtitle : null,
        content,
        text,
        characters,
        images,
        files,
        updatedAt: dayjs(),
      })
      .where(eq(PostContentStates.postId, postId));
  });
});
