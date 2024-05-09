import { getSchema } from '@tiptap/core';
import { and, asc, eq } from 'drizzle-orm';
import { traverse } from 'object-traversal';
import { prosemirrorJSONToYDoc } from 'y-prosemirror';
import * as Y from 'yjs';
import {
  database,
  notInArray,
  PostContentSnapshots,
  PostContentStates,
  PostRevisionContents,
  PostRevisions,
  Posts,
} from '$lib/server/database';
import { makePostContentId } from '$lib/server/utils';
import { extensions } from '$lib/tiptap';
import { createEmptyTiptapDocumentNode, getMetadataFromTiptapDocument } from '$lib/utils';
import type { JSONContent } from '@tiptap/core';

const migrateContent = (content: JSONContent) => {
  traverse(content, ({ parent }) => {
    if (!parent) {
      return;
    }

    if (parent.type === 'html' && parent.attrs && parent.attrs.content) {
      parent.content = [{ type: 'text', text: parent.attrs.content }];
      delete parent.attrs;
    }

    if (parent.type === 'gallery' && parent.attrs) {
      // eslint-disable-next-line unicorn/prefer-switch
      if (parent.attrs.layout === 'standalone') {
        parent.type = 'image';
        parent.attrs = {
          id: parent.attrs.ids[0],
          size: parent.attrs.size,
          align: parent.attrs.align,
        };
      } else if (parent.attrs.layout === 'scroll') {
        parent.attrs = {
          ids: parent.attrs.ids,
          layout: 'scroll',
          size: parent.attrs.size,
          align: parent.attrs.align,
        };
      } else if (parent.attrs.layout === 'grid') {
        parent.attrs = {
          ids: parent.attrs.ids,
          layout: parent.attrs.gridColumns === 2 ? 'grid-2' : 'grid-3',
          size: parent.attrs.size,
          align: parent.attrs.align,
        };
      } else if (parent.attrs.layout === 'slide') {
        parent.attrs = {
          ids: parent.attrs.ids,
          layout: parent.attrs.slidesPerPage === 1 ? 'slide-1' : 'slide-2',
          size: parent.attrs.size,
          align: parent.attrs.align,
        };
      }
    }
  });

  return content;
};

const schema = getSchema(extensions);

for (let i = 0; ; i++) {
  const posts = await database.select({ id: Posts.id }).from(Posts).where(eq(Posts.migrated, false)).limit(100);

  if (posts.length === 0) {
    break;
  }

  console.time(`Migrated ${i * 100 + posts.length} posts`);

  await Promise.all(
    posts.map((post) =>
      database.transaction(
        async (tx) => {
          // 각 포스트의 마지막 리비전 가져옴
          const lastRevisions = await tx
            .select({
              id: PostRevisions.id,
              title: PostRevisions.title,
              subtitle: PostRevisions.subtitle,
              freeContentId: PostRevisions.freeContentId,
              paidContentId: PostRevisions.paidContentId,
              price: PostRevisions.price,
              paragraphIndent: PostRevisions.paragraphIndent,
              paragraphSpacing: PostRevisions.paragraphSpacing,
              createdAt: PostRevisions.createdAt,
              updatedAt: PostRevisions.updatedAt,
            })
            .from(PostRevisions)
            .where(eq(PostRevisions.postId, post.id))
            .orderBy(asc(PostRevisions.createdAt))
            .limit(1);

          let title: string | null = null;
          let subtitle: string | null = null;
          let content: JSONContent;

          // 리비전이 없음 -> 빈 yDoc 생성
          if (lastRevisions.length === 0) {
            content = createEmptyTiptapDocumentNode().toJSON();
          } else {
            const [lastRevision] = lastRevisions;

            // 마지막 리비전 기준으로 yjs 초기 상태 생성 시작

            // document 재구축 시작
            const nodes = [];

            if (lastRevision.freeContentId) {
              const [content] = await tx
                .select({ data: PostRevisionContents.data })
                .from(PostRevisionContents)
                .where(eq(PostRevisionContents.id, lastRevision.freeContentId));

              nodes.push(...content.data);
            }

            nodes.push({
              type: 'access_barrier',
              attrs: {
                price: lastRevision.price,
              },
            });

            if (lastRevision.paidContentId) {
              const [content] = await tx
                .select({ data: PostRevisionContents.data })
                .from(PostRevisionContents)
                .where(eq(PostRevisionContents.id, lastRevision.paidContentId));

              nodes.push(...content.data);
            }

            const _proseMirrorDoc = {
              type: 'doc',
              content: [
                {
                  type: 'document',
                  attrs: {
                    documentParagraphIndent: lastRevision.paragraphIndent / 100,
                    documentParagraphSpacing: lastRevision.paragraphSpacing / 100,
                  },
                  content: nodes,
                },
              ],
            };
            // document 재구축 끝

            // document 구조 새 스키마에 맞춰 마이그레이션함
            content = migrateContent(_proseMirrorDoc);

            title = lastRevision.title;
            subtitle = lastRevision.subtitle;
          }

          // 마이그레이션한 document로 yjs document 생성함
          const yDoc = prosemirrorJSONToYDoc(schema, content, 'content');
          yDoc.getText('title').insert(0, title ?? '');
          yDoc.getText('subtitle').insert(0, subtitle ?? '');

          // 초기 상태 생성 & 저장함
          const update = Y.encodeStateAsUpdateV2(yDoc);
          const vector = Y.encodeStateVector(yDoc);
          const { text, characters, images, files } = getMetadataFromTiptapDocument(content);

          await tx.insert(PostContentStates).values({
            postId: post.id,
            update,
            vector,
            upToSeq: 0n,
            title,
            subtitle,
            content,
            text,
            characters,
            images,
            files,
            createdAt: lastRevisions[0]?.createdAt,
            updatedAt: lastRevisions[0]?.updatedAt,
          });

          // 초기 상태의 스냅샷 생성 & 저장함
          const snapshot = Y.encodeSnapshotV2(Y.snapshot(yDoc));
          await tx.insert(PostContentSnapshots).values({
            postId: post.id,
            data: snapshot,
            createdAt: lastRevisions[0]?.updatedAt,
          });

          // 마지막 리비전 기준으로 yjs 초기 상태 생성 끝

          // PUBLISHED 혹은 ARCHIVED 상태가 아닌 리비전 삭제
          await tx
            .delete(PostRevisions)
            .where(and(eq(PostRevisions.postId, post.id), notInArray(PostRevisions.kind, ['PUBLISHED', 'ARCHIVED'])));

          // 남아있는 리비전 다시 가져옴
          const revisions = await tx
            .select({
              id: PostRevisions.id,
              freeContentId: PostRevisions.freeContentId,
              paidContentId: PostRevisions.paidContentId,
              paragraphIndent: PostRevisions.paragraphIndent,
              paragraphSpacing: PostRevisions.paragraphSpacing,
            })
            .from(PostRevisions)
            .where(eq(PostRevisions.postId, post.id));

          await Promise.all(
            revisions.map(async (revision) => {
              // attributes 마이그레이션
              await tx
                .update(PostRevisions)
                .set({
                  attributes: {
                    documentParagraphIndent: revision.paragraphIndent / 100,
                    documentParagraphSpacing: revision.paragraphSpacing / 100,
                  },
                })
                .where(eq(PostRevisions.id, revision.id));

              // 컨텐츠 마이그레이션
              if (revision.freeContentId) {
                const [content] = await tx
                  .select({ data: PostRevisionContents.data })
                  .from(PostRevisionContents)
                  .where(eq(PostRevisionContents.id, revision.freeContentId));

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const nodes = migrateContent({ type: 'document', content: content.data }).content!;
                const id = await makePostContentId(tx, nodes);
                if (id) {
                  await tx.update(PostRevisions).set({ freeContentId: id }).where(eq(PostRevisions.id, revision.id));
                }
              }

              if (revision.paidContentId) {
                const [content] = await tx
                  .select({ data: PostRevisionContents.data })
                  .from(PostRevisionContents)
                  .where(eq(PostRevisionContents.id, revision.paidContentId));

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const nodes = migrateContent({ type: 'document', content: content.data }).content!;
                const id = await makePostContentId(tx, nodes);
                if (id) {
                  await tx.update(PostRevisions).set({ paidContentId: id }).where(eq(PostRevisions.id, revision.id));
                }
              }
            }),
          );

          // 마이그레이션 완료 마크
          await tx.update(Posts).set({ migrated: true }).where(eq(Posts.id, post.id));
        },
        { isolationLevel: 'read committed' },
      ),
    ),
  );

  console.timeEnd(`Migrated ${i * 100 + posts.length} posts`);
}

console.log('Migration complete');
