import dayjs from 'dayjs';
import { traverse } from 'object-traversal';
import { createTiptapDocument, documentToText } from '$lib/utils';
import { useCache } from '../cache';
import type { JSONContent } from '@tiptap/core';
import type { InteractiveTransactionClient } from '../prisma';

export const revisionContentToText = async (id: string, revisionContent: JSONContent[]): Promise<string> => {
  // PostRevision의 Content는 Immutable하니까 캐싱 좀 길어도 괜찮을 듯
  return await useCache(
    `PostRevision:${id}`,
    async () => documentToText(createTiptapDocument(revisionContent)),
    dayjs.duration(1, 'year').asSeconds(),
  );
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
  traverse(content, async ({ key, value, parent }) => {
    if (parent && key === 'type' && value === 'image') {
      if (!parent.attrs.id) {
        return;
      }

      const image = await db.image.findUnique({
        where: { id: parent.attrs.id },
        select: { id: true, width: true, height: true, placeholder: true, path: true },
      });

      if (!image) {
        return;
      }

      parent.attrs = {
        ...parent.attrs,
        __data: {
          id: image.id,
          width: image.width,
          height: image.height,
          placeholder: image.placeholder,
          url: `https://pnxl.net/${image.path}`,
        },
      };
    }

    if (parent && key === 'type' && value === 'file') {
      if (!parent.attrs.id) {
        return;
      }

      const file = await db.file.findUnique({
        where: { id: parent.attrs.id },
        select: { id: true, name: true, size: true, path: true },
      });

      if (!file) {
        return;
      }

      parent.attrs = {
        ...parent.attrs,
        __data: {
          id: file.id,
          name: file.name,
          size: file.size,
          url: `https://pnxl.net/${file.path}`,
        },
      };
    }
  });

  return content;
};
