import dayjs from 'dayjs';
import { createTiptapDocument, documentToText } from '$lib/utils';
import { useCache } from '../cache';
import type { JSONContent } from '@tiptap/core';

export const revisionContentToText = async (id: string, revisionContent: JSONContent[]): Promise<string> => {
  // PostRevision의 Content는 Immutable하니까 캐싱 좀 길어도 괜찮을 듯
  return await useCache(
    `PostRevision:${id}`,
    async () => documentToText(createTiptapDocument(revisionContent)),
    dayjs.duration(1, 'year').seconds(),
  );
};
