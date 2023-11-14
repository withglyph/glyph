import { Heading, Paragraph } from '$lib/tiptap/nodes';
import type { FontFamily } from '@penxle/lib/unocss';
import type { Node } from '@tiptap/pm/model';
import type { Alignment, Spacing } from '$lib/tiptap/extensions';
import type { Height } from '$lib/tiptap/extensions/line-height';
import type { Kind } from '$lib/tiptap/nodes/horizontal-rule';

export const colors = [
  { label: '검정색', value: null },
  { label: '회색', value: 'text-gray-50' },
  { label: '회색 2', value: 'text-gray-40' },
  { label: '빨간색', value: 'text-red-60' },
  { label: '파란색', value: 'text-blue-60' },
  { label: '갈색', value: 'text-orange-70' },
  { label: '초록색', value: 'text-green-60' },
  { label: '보라색', value: 'text-purple-60' },
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
  mono: 'Fira Code',
} satisfies Record<FontFamily, string>;

export const fonts = [
  { label: fontFamilyToLocaleString.sans, value: 'sans' },
  { label: fontFamilyToLocaleString.serif, value: 'serif' },
  { label: fontFamilyToLocaleString.mono, value: 'mono' },
] satisfies { label: string; value: FontFamily }[];

const heightToLocaleString = {
  3: '좁음', // .75
  none: '없음', // 1
  tight: '낮음 2', // 1.25
  snug: '낮음 1', // 1.375
  normal: '보통', // 1.5
  relaxed: '높음 1', // 1.625
  7: '높음 2', // 1.75
  loose: '높음 3', // 2
  9: '높음 4', // 2.25
  10: '높음 5', // 2.5
} satisfies Record<Height, string>;

export const heights: { label: string; value: Height }[] = [
  { label: heightToLocaleString[3], value: 3 },
  { label: heightToLocaleString.none, value: 'none' },
  { label: heightToLocaleString.tight, value: 'tight' },
  { label: heightToLocaleString.snug, value: 'snug' },
  { label: heightToLocaleString.normal, value: 'normal' },
  { label: heightToLocaleString.relaxed, value: 'relaxed' },
  { label: heightToLocaleString[7], value: 7 },
  { label: heightToLocaleString.loose, value: 'loose' },
  { label: heightToLocaleString[9], value: 9 },
  { label: heightToLocaleString[10], value: 10 },
];

const spacingToLocaleString = {
  tighter: '좁게 2',
  tight: '좁게 1',
  normal: '보통',
  wide: '넓게 1',
  wider: '넓게 2',
  widest: '넓게 3',
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

export const hr: Kind[] = [1, 2, 3, 4, 5, 6, 7];

export function getLabelFromCurrentNode(currentNode: Node) {
  return {
    font: fontFamilyToLocaleString[currentNode?.attrs['font-family']] ?? fontFamilyToLocaleString.sans,
  };
}
