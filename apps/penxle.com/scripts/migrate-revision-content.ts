import { getSchema, Node } from '@tiptap/core';
import { traverse } from 'object-traversal';
import { prismaClient } from '$lib/server/database';
import { extensions } from '$lib/tiptap';
import { createTiptapDocument } from '$lib/utils';
import type { JSONContent } from '@tiptap/core';

const letterSpacingMap: Record<string, number> = {
  tighter: -0.05,
  tight: -0.05,
  normal: 0,
  wide: 0.05,
  wider: 0.05,
  widest: 0.1,
};

const lineHeightMap: Record<string, number> = {
  none: 1,
  tight: 1.2,
  snug: 1.4,
  normal: 1.6,
  relaxed: 2,
  loose: 2.2,
};

const fontFamilyMap: Record<string, string> = {
  sans: 'Pretendard',
  serif: 'RIDIBatang',
  serif2: 'KoPubWorldBatang',
  serif3: 'NanumMyeongjo',
  mono: 'FiraCode',
};

const textColorMap: Record<string, string> = {
  'text-gray-50': '#78716c',
  'text-post-gray': '#78716c',
  'text-gray-40': '#a8a29e',
  'text-post-gray2': '#a8a29e',
  'text-post-lightgray': '#a8a29e',
  'text-red-60': '#ea4335',
  'text-post-red': '#ea4335',
  'text-blue-60': '#4285f4',
  'text-post-blue': '#4285f4',
  'text-orange-70': '#a96d42',
  'text-post-brown': '#a96d42',
  'text-green-60': '#00c75e',
  'text-post-green': '#00c75e',
  'text-purple-60': '#9747ff',
  'text-post-purple': '#9747ff',
  'text-white': '#ffffff',
  'text-post-white': '#ffffff',
};

const markTextNode = (node: JSONContent, marks: NonNullable<JSONContent['marks']>) => {
  if (!node.content) {
    return;
  }

  traverse(node.content, ({ key, value, parent }) => {
    if (parent && key === 'type' && value === 'text') {
      parent.marks = [...(parent.marks ?? []), ...marks];
      // @ts-expect-error any
      parent.marks = parent.marks.filter((mark, index, self) => self.findIndex((m) => m.type === mark.type) === index);
    }
  });
};

const filteredExtensions = extensions.filter((ext) => ext.name !== 'document');
const Document = Node.create({
  name: 'document',
  topNode: true,
  content: 'block+',
});
filteredExtensions.push(Document);

const schema = getSchema(filteredExtensions);

let offset = 0;
const chunkSize = 100;

// eslint-disable-next-line no-constant-condition
while (true) {
  const started = performance.now();

  const revisionContents = await prismaClient.postRevisionContent.findMany({
    select: { id: true, data: true },
    orderBy: { id: 'asc' },
    skip: offset,
    take: chunkSize,
  });

  if (revisionContents.length === 0) {
    break;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queries: any[] = [];

  for (const revisionContent of revisionContents) {
    const content = revisionContent.data as JSONContent[];

    traverse(content, ({ key, value, parent }) => {
      if (!parent) {
        return;
      }

      if (key === 'type' && value === 'uploading_image') {
        parent.type = 'paragraph';
        parent.attrs = { letterSpacing: 0, lineHeight: 1.6, textAlign: 'left' };
      }

      // `letter_spacing`, `line_height`, `text_align` 익스텐션을 deprecate하고 `paragraph`의 attribute로 옮김 (`heading`이 사라져서 `paragraph`에만 적용하면 됨)
      if (key === 'type' && (value === 'paragraph' || value === 'heading') && parent.attrs) {
        const letterSpacing = parent.attrs['letter-spacing'];
        if (letterSpacing) {
          delete parent.attrs['letter-spacing'];
          parent.attrs.letterSpacing = letterSpacingMap[letterSpacing] ?? 0;
        }

        const lineHeight = parent.attrs['line-height'];
        if (lineHeight) {
          delete parent.attrs['line-height'];
          parent.attrs.lineHeight = lineHeightMap[lineHeight] ?? 1.6;
        }

        const textAlign = parent.attrs['text-align'];
        if (textAlign) {
          delete parent.attrs['text-align'];
          parent.attrs.textAlign = textAlign ?? 'left';
        }
      }

      // font_family` 익스텐션을 deprecate하고 `font_family` 마크로 재구현함 (이제 인라인으로 적용 가능)
      if (key === 'type' && (value === 'paragraph' || value === 'heading') && parent.attrs?.['font-family']) {
        const fontFamily = parent.attrs['font-family'];
        delete parent.attrs['font-family'];

        if (fontFamily && fontFamily !== 'sans' && parent.content) {
          markTextNode(parent, [
            {
              type: 'font_family',
              attrs: {
                fontFamily: fontFamilyMap[fontFamily] ?? 'RIDIBatang',
              },
            },
          ]);
        }
      }

      // `horizontalRule` 노드를 deprecate하고 `horizontal_rule` 노드로 재구현함 (네이밍 이슈)
      if (key === 'type' && value === 'horizontalRule') {
        parent.type = 'horizontal_rule';
      }

      // `heading` 노드를 deprecate함 (이제 `paragraph` 노드로 처리 가능)
      if (key === 'type' && value === 'heading') {
        parent.type = 'paragraph';

        const level = parent.attrs?.level ?? 1;
        delete parent.attrs?.level;

        // eslint-disable-next-line unicorn/prefer-switch
        if (level === 1) {
          markTextNode(parent, [{ type: 'font_size', attrs: { fontSize: 24 } }, { type: 'bold' }]);
        } else if (level === 2) {
          markTextNode(parent, [{ type: 'font_size', attrs: { fontSize: 20 } }, { type: 'bold' }]);
        } else if (level === 3) {
          markTextNode(parent, [{ type: 'font_size', attrs: { fontSize: 18 } }, { type: 'bold' }]);
        }
      }

      // `paragraph`의 `level` attribute를 deprecate함 (이제 폰트 크기를 임의로 설정 가능)
      if (key === 'type' && value === 'paragraph') {
        const level = parent.attrs?.level;
        if (level) {
          delete parent.attrs.level;

          if (level === 2) {
            markTextNode(parent, [{ type: 'font_size', attrs: { fontSize: 13 } }]);
          }
        }
      }

      // `text_color` 마크를 deprecate하고 `font_color` 마크로 재구현함 (이제 프리셋 컬러 이름이 아닌 hex code를 입력받음)
      if (key === 'type' && value === 'text-color') {
        const color = parent.attrs?.['data-text-color'];
        delete parent.attrs?.['data-text-color'];

        parent.type = 'font_color';
        parent.attrs = { fontColor: textColorMap[color] ?? '#1c1917' };
      }
    });

    if (content.length === 0) {
      content.push({ type: 'paragraph', attrs: { letterSpacing: 0, lineHeight: 1.6, textAlign: 'left' } });
    }

    try {
      const node = schema.nodeFromJSON(createTiptapDocument(content));
      node.check();
      const data = node.toJSON().content;

      // const hash = Buffer.from(
      //   await webcrypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(data))),
      // ).toString('hex');

      queries.push(
        prismaClient.postRevisionContent.update({
          select: { id: true },
          where: { id: revisionContent.id },
          data: { data, hash: revisionContent.id },
        }),
      );
    } catch (err) {
      console.error(`Error migrating ${revisionContent.id}...`);
      console.error(err);
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    }
  }

  await Promise.all(queries);

  const end = performance.now();

  offset += chunkSize;
  console.log(`Migrated ${offset} revision contents (elapsed: ${end - started}ms)`);
}
