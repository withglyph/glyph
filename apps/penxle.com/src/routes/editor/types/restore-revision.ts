import type { JSONContent } from '@tiptap/core';
import type { PostRevisionContentKind, PostRevisionKind } from '$glitch';

export type RestoredRevision = {
  id: string;
  kind: PostRevisionKind;
  contentKind: PostRevisionContentKind;
  content: JSONContent;
  title: string;
  subtitle?: string | null | undefined;
  tags: { id: string; name: string }[];
} | null;
