import dayjs from 'dayjs';
import { traverse } from 'object-traversal';
import { createTiptapDocument, documentToText } from '$lib/utils';
import { useCache } from '../cache';
import type { JsonValue } from '@prisma/client/runtime/library';
import type { JSONContent } from '@tiptap/core';
import type { InteractiveTransactionClient } from '../prisma';

type RevisionContent = {
  id: string;
  data: JSONContent[] | JsonValue;
};

export const revisionContentToText = async (revisionContent: RevisionContent): Promise<string> => {
  if (revisionContent.data) {
    // PostRevision의 Content는 Immutable하니까 캐싱 좀 길어도 괜찮을 듯
    return await useCache(
      `PostRevisionContent:${revisionContent.id}`,
      async () => documentToText(createTiptapDocument(revisionContent.data as JSONContent[])),
      dayjs.duration(1, 'year').asSeconds(),
    );
  }
  return '';
};

export const sanitizeContent = async (content: JSONContent[]): Promise<JSONContent[]> => {
  traverse(content, async ({ key, value, parent }) => {
    if (parent && key === 'attrs' && typeof value === 'object') {
      parent.attrs = Object.fromEntries(Object.entries(value).filter(([key]) => !key.startsWith('__')));
    }
  });

  return content;
};

export const decorateContent = async (
  db: InteractiveTransactionClient,
  content: JSONContent[],
): Promise<JSONContent[]> => {
  return Promise.all(
    content.map(async (node) => {
      if (node.type === 'image') {
        if (!node.attrs?.id) {
          return node;
        }

        const image = await db.image.findUnique({
          where: { id: node.attrs.id },
          select: { id: true, width: true, height: true, placeholder: true, path: true },
        });

        if (!image) {
          return node;
        }

        return {
          ...node,
          attrs: {
            ...node.attrs,
            __data: {
              id: image.id,
              width: image.width,
              height: image.height,
              placeholder: image.placeholder,
              url: `https://pnxl.net/${image.path}`,
            },
          },
        };
      }

      if (node.type === 'file') {
        if (!node.attrs?.id) {
          return node;
        }

        const file = await db.file.findUnique({
          where: { id: node.attrs.id },
          select: { id: true, name: true, size: true, path: true },
        });

        if (!file) {
          return node;
        }

        return {
          ...node,
          attrs: {
            ...node.attrs,
            __data: {
              id: file.id,
              name: file.name,
              size: file.size,
              url: `https://pnxl.net/${file.path}`,
            },
          },
        };
      }

      return node;
    }),
  );
};
