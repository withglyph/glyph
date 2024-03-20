import dayjs from 'dayjs';
import { traverse } from 'object-traversal';
import { createTiptapDocument, documentToText } from '$lib/utils';
import { useCache } from '../cache';
import type { JSONContent } from '@tiptap/core';
import type { Prisma } from '$prisma';
import type { InteractiveTransactionClient } from '../prisma';

type RevisionContent = {
  id: string;
  data: JSONContent[] | Prisma.JsonValue;
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

export const isEmptyContent = (content: JSONContent[]): boolean => {
  if (content.length === 0) {
    return true;
  }

  if (content.length === 1 && content[0].type === 'paragraph' && !content[0].content?.length) {
    return true;
  }

  return false;
};

export const sanitizeContent = async (content: JSONContent[]): Promise<JSONContent[]> => {
  traverse(content, ({ key, value, parent }) => {
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
          select: { id: true, path: true },
          where: { id: node.attrs.id },
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
              url: `https://glyph.pub/${image.path}`,
            },
          },
        };
      }

      if (node.type === 'gallery') {
        if (!node.attrs?.ids?.length) {
          return node;
        }

        const images = await db.image.findMany({
          select: { id: true, name: true, color: true, path: true },
          where: { id: { in: node.attrs.ids } },
        });

        return {
          ...node,
          attrs: {
            ...node.attrs,
            __data: node.attrs.ids
              .map((id: string) => {
                const image = images.find((i) => i.id === id);
                if (!image) {
                  return null;
                }

                return {
                  id: image.id,
                  kind: 'data',
                  __data: {
                    id: image.id,
                    name: image.name,
                    color: image.color,
                    url: `https://glyph.pub/${image.path}`,
                  },
                };
              })
              .filter(Boolean),
          },
        };
      }

      if (node.type === 'file') {
        if (!node.attrs?.id) {
          return node;
        }

        const file = await db.file.findUnique({
          select: { id: true, name: true, size: true, path: true },
          where: { id: node.attrs.id },
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
              url: `https://glyph.pub/${file.path}`,
            },
          },
        };
      }

      if (node.type === 'embed') {
        if (!node.attrs?.url) {
          return node;
        }

        const embed = await db.embed.findUnique({
          select: { type: true, title: true, description: true, thumbnailUrl: true, html: true },
          where: { url: node.attrs.url },
        });

        if (!embed) {
          return node;
        }

        return {
          ...node,
          attrs: {
            ...node.attrs,
            __data: {
              type: embed.type,
              title: embed.title,
              description: embed.description,
              thumbnailUrl: embed.thumbnailUrl,
              html: embed.html,
            },
          },
        };
      }

      return node;
    }),
  );
};
