import type { JSONContent } from '@tiptap/core';

export const createTiptapDocument = (content: JSONContent[]): JSONContent => ({ type: 'document', content });
export const createTiptapNode = (node: JSONContent): JSONContent => node;
