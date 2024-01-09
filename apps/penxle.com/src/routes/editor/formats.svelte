<script context="module" lang="ts">
  import { BulletList, Heading, OrderedList, Paragraph } from '$lib/tiptap/nodes';
  import type { FontFamily } from '@penxle/lib/unocss';
  import type { Node } from '@tiptap/pm/model';
  import type { Alignment, Spacing } from '$lib/tiptap/extensions';
  import type { Height } from '$lib/tiptap/extensions/line-height';

  export const colors = [
    { label: '검정색', value: null },
    { label: '회색', value: 'text-post-gray' },
    { label: '연회색', value: 'text-post-lightgray' },
    { label: '빨간색', value: 'text-post-red' },
    { label: '파란색', value: 'text-post-blue' },
    { label: '갈색', value: 'text-post-brown' },
    { label: '초록색', value: 'text-post-green' },
    { label: '보라색', value: 'text-post-purple' },
    { label: '흰색', value: 'text-post-white', display: 'text-gray-20' },
  ];

  export const heading = Heading.name as 'heading';
  export const paragraph = Paragraph.name as 'paragraph';

  export const texts: ({ label: string; class: string } & (
    | { name: typeof heading; level: 1 | 2 | 3 }
    | { name: typeof paragraph; level: 1 | 2 }
  ))[] = [
    { label: '제목 1', class: 'title-24-b', name: heading, level: 1 },
    { label: '제목 2', class: 'title-20-b', name: heading, level: 2 },
    { label: '제목 3', class: 'subtitle-18-b', name: heading, level: 3 },
    { label: '본문 1', class: 'body-16-m', name: paragraph, level: 1 },
    { label: '본문 2', class: 'body-13-m', name: paragraph, level: 2 },
  ];

  export const fontFamilyToLocaleString: Record<string, string> = {
    sans: '프리텐다드',
    serif: '리디바탕',
    serif2: 'KoPubWorld 바탕',
    serif3: '나눔명조',
    mono: 'Fira Code',
  } satisfies Record<FontFamily, string>;

  export const fonts = [
    { label: fontFamilyToLocaleString.sans, value: 'sans', class: 'font-sans' },
    { label: fontFamilyToLocaleString.serif, value: 'serif', class: 'font-serif' },
    { label: fontFamilyToLocaleString.serif2, value: 'serif2', class: 'font-serif2' },
    { label: fontFamilyToLocaleString.serif3, value: 'serif3', class: 'font-serif3' },
    { label: fontFamilyToLocaleString.mono, value: 'mono', class: 'font-mono' },
  ] satisfies { label: string; value: FontFamily; class: string }[];

  const heightToLocaleString = {
    none: '매우 좁음', // 1
    tight: '더 좁음', // 1.25
    snug: '좁음', // 1.375
    normal: '보통', // 1.5
    relaxed: '넓음', // 1.625
    loose: '매우 넓음', // 2
  } satisfies Record<Height, string>;

  export const heights: { label: string; value: Height }[] = [
    { label: heightToLocaleString.none, value: 'none' },
    { label: heightToLocaleString.tight, value: 'tight' },
    { label: heightToLocaleString.snug, value: 'snug' },
    { label: heightToLocaleString.normal, value: 'normal' },
    { label: heightToLocaleString.relaxed, value: 'relaxed' },
    { label: heightToLocaleString.loose, value: 'loose' },
  ];

  const spacingToLocaleString = {
    tighter: '더 좁음',
    tight: '좁게',
    normal: '보통',
    wide: '넓음',
    wider: '더 넓음',
    widest: '매우 넓음',
  } satisfies Record<Spacing, string>;

  export const spacing: { label: string; value: Spacing }[] = [
    { label: spacingToLocaleString.tighter, value: 'tighter' },
    { label: spacingToLocaleString.tight, value: 'tight' },
    { label: spacingToLocaleString.normal, value: 'normal' },
    { label: spacingToLocaleString.wide, value: 'wide' },
    { label: spacingToLocaleString.wider, value: 'wider' },
    { label: spacingToLocaleString.widest, value: 'widest' },
  ];

  export const alignments: { label: string; value: Alignment; class: string }[] = [
    { label: '왼쪽', value: 'left', class: 'i-lc-align-left' },
    { label: '중앙', value: 'center', class: 'i-lc-align-center' },
    { label: '오른쪽', value: 'right', class: 'i-lc-align-right' },
    { label: '양쪽', value: 'justify', class: 'i-lc-align-justify' },
  ];

  export const list = [
    { name: BulletList.name, label: '불릿 리스트' },
    { name: OrderedList.name, label: '숫자 리스트' },
  ];

  export const hr = [1, 2, 3, 4, 5, 6, 7] as const;

  export const blockquotes = [1, 2, 3] as const;

  export function getToggledFormat(currentNode?: Node) {
    const fontName = currentNode?.attrs['font-family'];
    const alignmentName = currentNode?.attrs['text-align'];

    const text = {
      label: `${currentNode?.type.name === heading ? '제목' : '본문'} ${currentNode?.attrs.level ?? 1}`,
    };
    const font = fonts.find((font) => font.value === fontName) ?? alignments[0];
    const alignment = alignments.find(({ value }) => value === alignmentName) ?? alignments[0];
    return {
      text,
      font,
      alignment,
    };
  }
</script>
