import { getSchema, getText, getTextSerializersFromSchema } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
import { extensions } from '$lib/tiptap';
import type { JSONContent } from '@tiptap/core';

export const createTiptapDocument = (content: JSONContent[]): JSONContent => ({ type: 'document', content });
export const createTiptapNode = (node: JSONContent): JSONContent => node;
export const documentToText = (document: JSONContent): string => {
  const schema = getSchema(extensions);
  return getText(Node.fromJSON(schema, document), {
    blockSeparator: '\n',
    textSerializers: {
      ...getTextSerializersFromSchema(schema),
    },
  });
};
