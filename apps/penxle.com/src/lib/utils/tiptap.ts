import { getSchema, getText, getTextSerializersFromSchema } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
import { extensions } from '$lib/tiptap';
import { Image } from '$lib/tiptap/node-views';
import { isValidImageFile } from '$lib/utils';
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

export const transformToTiptapImages = async (files: File[]): Promise<JSONContent[]> => {
  const validates = await Promise.all(files.map(async (file) => ({ file, valid: await isValidImageFile(file) })));
  const filtered = validates.filter(({ valid }) => valid).map(({ file }) => file);
  const content = filtered.map((file) => ({ type: Image.name, attrs: { __file: file } }));

  return content;
};
