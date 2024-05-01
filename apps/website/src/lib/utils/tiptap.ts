import { getSchema } from '@tiptap/core';
import { Node, Schema } from '@tiptap/pm/model';
import { extensions } from '$lib/tiptap';
import type { JSONContent } from '@tiptap/core';

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

export const getMetadataFromTiptapDocument = (content: JSONContent) => {
  const doc = Node.fromJSON(getSchema(extensions), content);
  const characters = doc.content.textBetween(0, doc.content.size, '\n').length;

  const text = doc.content.textBetween(0, doc.content.size, '\n', (node) => {
    // eslint-disable-next-line unicorn/prefer-switch
    if (node.type.name === 'access_barrier') {
      return '--- 결제선 ---';
    } else if (node.type.name === 'image' || node.type.name === 'gallery') {
      return '<이미지>';
    } else if (node.type.name === 'file') {
      return '<파일>';
    } else if (node.type.name === 'embed') {
      return '<외부 미디어>';
    } else {
      return '';
    }
  });

  let images = 0;
  let files = 0;

  doc.descendants((node) => {
    // eslint-disable-next-line unicorn/prefer-switch
    if (node.type.name === 'image') {
      images += 1;
    } else if (node.type.name === 'gallery') {
      images += node.attrs.ids.length;
    } else if (node.type.name === 'file') {
      files += 1;
    }
  });

  return {
    text,
    characters,
    images,
    files,
  };
};
