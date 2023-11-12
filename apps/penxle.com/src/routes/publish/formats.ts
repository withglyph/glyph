import { Heading, Paragraph } from '$lib/tiptap/nodes';
import type { FontFamily } from '@penxle/lib/unocss';

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
