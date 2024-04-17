import { getSchema, getText, getTextSerializersFromSchema } from '@tiptap/core';
import { Node, Schema } from '@tiptap/pm/model';
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
export const validateTiptapDocument = (document: JSONContent) => {
  try {
    const schema = getSchema(extensions);
    Node.fromJSON(schema, document).check();
    return true;
  } catch {
    return false;
  }
};

export const isEmptyTextBlock = (node: Node) => node.isTextblock && node.textContent.trim().length === 0;

export const createEmptyTiptapDocumentNode = (schema?: Schema): Node => {
  schema ??= getSchema(extensions);

  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  return schema.topNodeType.createAndFill(null, [
    schema.nodes.document.createAndFill(null, [
      schema.nodes.paragraph.createAndFill()!,
      schema.nodes.access_barrier.createAndFill()!,
    ])!,
  ])!;
  /* eslint-enable @typescript-eslint/no-non-null-assertion */
};
