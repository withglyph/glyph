import type { PostRevisionContentKind, PostRevisionKind, Tag } from '@prisma/client';
import type { JSONContent } from '@tiptap/core';

export type RestoredRevision = {
  id: string;
  kind: PostRevisionKind;
  contentKind: PostRevisionContentKind;
  content: JSONContent;
  title: string;
  subtitle?: string | null | undefined;
  tags: Pick<Tag, 'id' | 'name'>[];
} | null;
